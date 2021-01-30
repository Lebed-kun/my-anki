import { ServiceContext } from "../types";
import { Filter } from "./filter";

export class GetTemplateFilter implements Filter {
    public validate(method: string, _action: string, _body: any) {
        return method === "GET";
    }

    public async execute(_body: any, context: ServiceContext) {
        const template = context.fallbackPage;

        return {
            contentType: "text/html",
            body: template
        }
    }
}
