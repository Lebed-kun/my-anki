import { ServiceContext } from "../types";
import { Filter } from "./filter";

export class DecksFilter implements Filter {
    public validate(method: string, action: string, _body: any) {
        return (method === "POST") && 
            (action === "decks");
    }

    public async execute(_body: any, context: ServiceContext) {
        const marshalledNames = await JSON.stringify(context.memConfig.deckNames);

        return {
            contentType: "application/json",
            body: marshalledNames
        }
    }
}
