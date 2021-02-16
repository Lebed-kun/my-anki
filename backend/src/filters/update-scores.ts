import { ServiceContext, Filter, AnkiCardRef } from "../types";
import { corsHeaders } from "./cors";
import { supermemo } from "../utils/supermemo";

export class UpdateScoresFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.deck_name === "string") &&
            (typeof body.cards === "object");
    }

    public async execute(body: any, context: ServiceContext) {
        const deck = context.memConfig.decks.get(body.deck_name);

        if (typeof deck === "undefined") {
            return {
                status: Number(process.env.STATUS_NOT_FOUND!),
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders
                },
                body: `Deck named "${body.name}" was not found!`
            }
        }
        
        const backgroundTasks = [];

        for (const [cardName, cardInfo] of deck) {

        }
    }
}
