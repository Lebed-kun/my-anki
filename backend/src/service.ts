import { Routes, ServiceResponse, Filter, ServiceContext } from "./types";

export class Service {
    private context?: ServiceContext;
    private routes?: Routes; 

    constructor(routes: Routes, context: ServiceContext) {
        this.routes = routes;
        this.context = context;
    }

    private async handleAction(filter: Filter, body: any, context: ServiceContext): 
        Promise<ServiceResponse> 
    {
        try {
            const response = await filter.execute(body, context);
            return response;
        } catch (err) {
            return {
                status: Number(process.env.STATUS_BAD_REQUEST!),
                headers: {
                    "Content-Type": "text/plain"
                },
                body: err.message
            };
        }
    }

    /// The first value in promise result is json parsing result
    /// The second value in promise result is error message
    private async parseJSONBody(rawBody: string): Promise<[any, (string | undefined)]> {
        try {
            const body = await JSON.parse(rawBody);
            return [body, undefined];
        } catch (err) {
            return [undefined, err.message];
        }
    }

    public async exec(
        method: string, 
        action: string,
        contentType: string, 
        rawBody: string
    ): Promise<ServiceResponse> {
        if (typeof this.routes === "undefined") {
            throw "Routes not initialized!";
        }

        if (typeof this.context === "undefined") {
            throw "Service context not initialized!"
        }

        const filters = this.routes.get(method);
            
        if (!filters?.has(action)) {
            return {
                status: Number(process.env.STATUS_NOT_FOUND!),
                headers: {
                    "Content-Type": "text/plain"
                },
                body: `Route ${method} /${action} not found!`
            };
        } 

        const [body, parsingError] = await (
            contentType === "application/json" ?
                this.parseJSONBody(rawBody) : 
                ["", undefined]
        );

        if (typeof parsingError !== "undefined") {
            return {
                status: Number(process.env.STATUS_BAD_REQUEST!),
                headers: {
                    "Content-Type": "text/plain"
                },
                body: `Syntax error in body:\n\n${rawBody}\n\n==========\n\n${parsingError}`
            }
        }

        const filter = filters.get(action)!;

        if (!filter.validate(body)) {
            return {
                status: Number(process.env.STATUS_BAD_REQUEST!),
                headers: {
                    "Content-Type": "text/plain"
                },
                body: `Incorrect body:\n\n${JSON.stringify(body)}`
            };
        }

        return await this.handleAction(filter, body, this.context);
    }
}