import { ServiceContext, Filter } from "../types";
import { corsHeaders } from "./cors";

export class DecksFilter implements Filter {
    public validate(_body: any) {
        return true;
    }

    public async execute(_body: any, context: ServiceContext) {
        const decks = await context.db.collection("decks")
            .find({})
            .toArray();

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: JSON.stringify(decks)
        }
    }
}
