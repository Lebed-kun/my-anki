import { Router } from "../../router";
import { State, AnkiCardRef, HookContext, } from "../../types";
import fs from "fs";
import path from "path";
import { supermemo } from "../../utils/supermemo";

enum CardSide {
    Front,
    Back
}

interface AnkiStateDict { 
    [name: string]: AnkiCardRef 
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const isCardReadyToMemo = (stats: AnkiCardRef, now: Date): boolean => {
    if (typeof stats.passedAt === "undefined") {
        return true;
    }

    const passedAtMs = stats.passedAt.getTime();
    const willReadyMs = passedAtMs + (stats.interval * DAY_IN_MS);
    const nowMs = now.getTime();

    return nowMs >= willReadyMs;
};

const readCard = async (
    ctx: HookContext<State>,
    cardSide: CardSide
) => {
    const body = ctx.request.body;

    const fileReadPromise: Promise<Buffer> = new Promise(
        (res, rej) => {
            fs.readFile(
                path.join(
                    ctx.state.resourcesPath,
                    process.env.PATH_DECKS!,
                    body.deck_name,
                    body.card_name,
                    `${cardSide === CardSide.Back ? "back" : "front"}.html`,
                ),
                (err, data) => {
                    if (err !== null) {
                        rej(err);
                    } else {
                        res(data);
                    }
                }
            );
        }
    );

    const htmlBuffer = await Promise.resolve(fileReadPromise);
    return await htmlBuffer.toString("utf-8");
}

const prepareTransactions = (
    body: any, 
    ankiState: AnkiStateDict,
    now: Date
) => {
    const transactions = [];
    const nowStr = now.toISOString();

    for (let cardName in body.cards) {
        const cardData = ankiState[cardName];
        const nextAnkiState = supermemo(
            {
                interval: cardData.interval,
                repetition: cardData.repetition,
                efactor: cardData.efactor
            },
            body.cards[cardName]
        );

        transactions.push({
            updateOne: {
                filter: {
                    uid: cardName,
                    deckUid: body.deck_name
                },
                update: {
                    $set: {
                        ...nextAnkiState,
                        passedAt: nowStr
                    }
                }
            }
        })
    }

    return transactions;
}

export const createAnkiRoutes = () => {
    const router = new Router<State>("/anki");

    router.get("/decks", async (ctx) => {
        const decks = await ctx.state.db.collection("decks")
            .find({})
            .toArray();

        ctx.response.status = Number(process.env.STATUS_OK!);
        ctx.response.headers = {
            ...ctx.response.headers,
            "content-type": "application/json"
        };
        ctx.response.body = decks;
    });

    router.post("/deck-cards", async (ctx) => {
        const body = ctx.request.body;

        if (typeof body !== "object" || typeof body.name !== "string") {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.body = "Invalid request body of /deck-cards";
            return;
        }

        const now = new Date();
        const deckCards = await ctx.state.db.collection("cards")
            .find(
                {
                    deckUid: body.name
                }
            )
            .toArray();

        const cards = body.supermemoOn ? deckCards.filter(
            card => isCardReadyToMemo(
                {
                    ...card,
                    passedAt: card.passedAt ? new Date(card.passedAt) : undefined
                },
                now
            )
        ) : deckCards;

        ctx.response.status = Number(process.env.STATUS_OK!);
        ctx.response.headers = {
            ...ctx.response.headers,
            "content-type": "application/json",
        };
        ctx.response.body = cards;
    });

    router.post("/card", async (ctx) => {
        if (
            (typeof ctx.request.body !== "object") ||
            (typeof ctx.request.body.deck_name !== "string") ||
            (typeof ctx.request.body.card_name !== "string")
        ) {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.body = "Invalid request body of /card";
            return;
        }

        try {
            const [frontSide, backSide] = await Promise.all(
                [
                    readCard(ctx, CardSide.Front),
                    readCard(ctx, CardSide.Back)
                ]
            );

            ctx.response.status = Number(process.env.STATUS_OK!);
            ctx.response.headers = {
                ...ctx.response.headers,
                "content-type": "application/json"
            };
            ctx.response.body = {
                front: frontSide,
                back: backSide
            };
        } catch (err) {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.headers = {
                ...ctx.response.headers,
                "content-type": "text/plain"
            };
            ctx.response.body = String(err.message);
        }
    });

    router.post("/update-scores", async (ctx) => {
        if (
            (typeof ctx.request.body !== "object") ||
            (typeof ctx.request.body.deck_name !== "string") ||
            (typeof ctx.request.body.cards !== "object")
        ) {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.body = "Invalid request body of /update-scores";
            return;
        }

        const db = ctx.state.db;
        const body = ctx.request.body;

        const ankiStates: AnkiStateDict = {};
        await db.collection("cards")
            .find({
                deckUid: body.deck_name
            })
            .forEach(card => {
                ankiStates[card.uid] = {
                    interval: card.interval,
                    repetition: card.repetition,
                    efactor: card.efactor,
                    passedAt: card.passedAt
                }
            });

        const transactions = prepareTransactions(body, ankiStates, new Date());
        await db.collection("cards").bulkWrite(transactions);

        ctx.response.status = Number(process.env.STATUS_OK!);
        ctx.response.headers = {
            ...ctx.response.headers,
            "content-type": "application/json"
        };
        ctx.response.body = {
            success: true
        };
    });

    return router.toHook();
}
