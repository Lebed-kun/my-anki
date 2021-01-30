import { ServiceContext } from "../types";
import { Filter } from "./filter";

export class DecksCardsFilter implements Filter {
    public validate(method: string, action: string, body: any) {
        return (method === "POST") &&
            (action === "deck-cards") && 
            (typeof body === "object") &&
            (typeof body.name === "string");
    }

    public async execute(body: any, context: ServiceContext) {
        const deckCardNames = context.memConfig.decks.get(body.name);
        const marshalledCardNames = await JSON.stringify(deckCardNames);

        return {
            contentType: "application/json",
            body: marshalledCardNames
        }
    }
}
