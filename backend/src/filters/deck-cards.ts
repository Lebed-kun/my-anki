import { ServiceContext, Filter } from "../types";
import { corsHeaders } from "./cors";

export class DecksCardsFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.name === "string");
    }

    public async execute(body: any, context: ServiceContext) {
        const deckCardNames = context.memConfig.decks.get(body.name);

        if (typeof deckCardNames === "undefined") {
            return {
                status: Number(process.env.STATUS_NOT_FOUND!),
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders
                },
                body: `Deck named "${body.name}" was not found!`
            }
        }

        const marshalledCardNames = await JSON.stringify(deckCardNames);

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
