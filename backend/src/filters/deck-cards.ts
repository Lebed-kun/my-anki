import { ServiceContext, Filter, AnkiCardRef } from "../types";
import { corsHeaders } from "./cors";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export class DecksCardsFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.name === "string");
    }

    private isCardReadyToMemo(stats: AnkiCardRef, now: Date): boolean {
        if (typeof stats.passedAt === "undefined") {
            return true;
        }
        
        const passedAtMs = stats.passedAt.getTime();
        const willReadyMs = passedAtMs + (stats.interval * DAY_IN_MS);
        const nowMs = now.getTime();

        return nowMs >= willReadyMs;
    }

    public async execute(body: any, context: ServiceContext) {
        const now = new Date();
        const deckCards = await context.db.collection("cards")
            .find(
                {
                    deckUid: body.name
                }
            )
            .toArray();

        const cards = body.supermemoOn ? deckCards.filter(
            card => this.isCardReadyToMemo(
                {
                    ...card,
                    passedAt: card.passedAt ? new Date(card.passedAt) : undefined
                },
                now
            )
        ) : deckCards;

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: JSON.stringify(cards)
        }
    }
}
