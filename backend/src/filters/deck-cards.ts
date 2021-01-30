import { ServiceContext, Filter } from "../types";

export class DecksCardsFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.name === "string");
    }

    public async execute(body: any, context: ServiceContext) {
        const deckCardNames = context.memConfig.decks.get(body.name);
        const marshalledCardNames = await JSON.stringify(deckCardNames);

        return {
            status: Number(process.env.STATUS_OK!),
            contentType: "application/json",
            body: marshalledCardNames
        }
    }
}
