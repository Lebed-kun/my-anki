import { ServiceContext, Filter, AnkiCardRef } from "../types";
import { corsHeaders } from "./cors";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
type StatsFilter = (stats: AnkiCardRef, now: Date) => boolean;

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

    private toCardNames(
        cards: Map<string, AnkiCardRef>,
        now: Date,
        statsFilter?: StatsFilter,
    ): string[] {
        const result: string[] = [];
        
        for (const [name, stats] of cards) {
            if (!statsFilter || statsFilter(stats, now)) {
                result.push(name);
            }
        }

        return result;
    }

    public async execute(body: any, context: ServiceContext) {
        const deckCards = context.memConfig.decks.get(body.name);

        if (typeof deckCards === "undefined") {
            return {
                status: Number(process.env.STATUS_NOT_FOUND!),
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders
                },
                body: `Deck named "${body.name}" was not found!`
            }
        }

        const cardNames = this.toCardNames(
            deckCards,
            (new Date()),
            (body.supermemoOn ? this.isCardReadyToMemo : undefined)
        );

        const marshalledCardNames = await JSON.stringify(cardNames);

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: marshalledCardNames
        }
    }
}
