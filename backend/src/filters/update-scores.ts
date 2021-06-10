import { ServiceContext, Filter, AnkiCardRef } from "../types";
import { corsHeaders } from "./cors";
import { supermemo, SuperMemoGradeDict } from "../utils/supermemo";
import { TaskType } from "../background/types";

interface AnkiStateDict { 
    [name: string]: AnkiCardRef 
}

export class UpdateScoresFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.deck_name === "string") &&
            (typeof body.cards === "object");
    }

    private prepareTransactions(
        body: any, 
        ankiState: AnkiStateDict,
        now: Date
    ) {
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

    public async execute(body: any, context: ServiceContext) {
        const ankiStates: AnkiStateDict = {};
        await context.db.collection("cards")
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

        const transactions = this.prepareTransactions(body, ankiStates, new Date());
        await context.db.collection("cards").bulkWrite(transactions);

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: JSON.stringify({
                success: true
            })
        }
    }
}
