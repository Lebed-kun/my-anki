import { ServiceContext, Filter } from "../types";
import { corsHeaders } from "./cors";

export class DecksFilter implements Filter {
    public validate(_body: any) {
        return true;
    }

    public async execute(_body: any, context: ServiceContext) {
        const marshalledNames = await JSON.stringify(context.memConfig.deckNames);

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: marshalledNames
        }
    }
}
