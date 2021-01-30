import { ServiceContext, Filter } from "../types";

export class GetTemplateFilter implements Filter {
    public validate(_body: any) {
        return true;
    }

    public async execute(_body: any, context: ServiceContext) {
        const template = context.fallbackPage;

        return {
            status: Number(process.env.STATUS_OK!),
            contentType: "text/html",
            body: template
        }
    }
}
