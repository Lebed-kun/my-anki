import fs from "fs";
import path from "path";

import { AnkiConfig, AnkiCardRef, ServiceContext, Routes, ServiceResponse, Filter } from "./types";

export class Service {
    private context?: ServiceContext;
    private routes?: Routes; 

    private shallowValidateConf(rawConfig: any) {
        if (typeof rawConfig !== "object") {
            throw "Config must be an object!";
        }

        const deckNames = rawConfig.deck_names;
        if (!Array.isArray(deckNames)) {
            throw "Config must contain a list of deck names called \"deck_names\"!";
        }

        const decks = rawConfig.decks;
        if (typeof decks !== "object") {
            throw "Config must contain a named list of anki card links lists called \"decks\"!";
        }
    }

    private unmarshallDeckNames(rawConfig: any): string[] {
        const rawDeckNames = rawConfig.deck_names;
        for (let i = 0; i < rawDeckNames.length; ++i) {
            if (typeof rawDeckNames[i] !== "string") {
                throw `Config deck names contain invalid name at ${i}!`;
            }
        }

        return rawDeckNames;
    }

    private unmarshallDecks(rawConfig: any): Map<string, AnkiCardRef[]> {
        const decks: Map<string, AnkiCardRef[]> = new Map();
        const rawDecks = rawConfig.decks;

        for (let deckName in rawDecks) {
            if (!Array.isArray(rawDecks[deckName])) {
                throw `Object decks contain invalid anki ref list with name \"${deckName}\"!`;
            }

            for (let i = 0; i < rawDecks[deckName].length; ++i) {
                if (typeof rawDecks[deckName][i] !== "string") {
                    throw `Object deck \"${deckName}\" contains invalid anki ref at ${i}!`;
                }
            }

            decks.set(deckName, rawDecks[deckName]);
        }

        return decks;
    }

    private setupConfig(resourcesPath: string): AnkiConfig {
        const rawContent = fs.readFileSync(
            path.join(
                resourcesPath, 
                process.env.CONFIG_PATH!
            )
        );
        
        const parsedContent = JSON.parse(rawContent.toString("utf-8")); 
        this.shallowValidateConf(parsedContent);

        const deckNames = this.unmarshallDeckNames(parsedContent);
        const decks = this.unmarshallDecks(parsedContent);
        
        return {
            deckNames,
            decks
        };
    }

    private setupFallbackPage(resourcesPath: string): string {
        const rawContent = fs.readFileSync(
            path.join(
                resourcesPath,
                process.env.GET_TEMPLATE_PATH!
            )
        );


        return rawContent.toString("utf-8");
    }

    constructor(routes: Routes) {
        this.routes = routes;
    }

    public init() {
        const resourcesPath = path.join(
            __dirname,
            "..",
            ".."
        );
        const memConfig = this.setupConfig(resourcesPath);
        const fallbackPage = this.setupFallbackPage(resourcesPath);

        this.context = {
            resourcesPath,
            memConfig,
            fallbackPage
        };
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
                contentType: "text/plain",
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
        if (
            (typeof this.routes !== "undefined") &&
            (typeof this.context !== "undefined")
        ) {
            const filters = this.routes.get(method);
            
            if (!filters?.has(action)) {
                return {
                    status: Number(process.env.STATUS_NOT_FOUND!),
                    contentType: "text/plain",
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
                    contentType: "text/plain",
                    body: `Syntax error in body:\n\n${rawBody}\n\n==========\n\n${parsingError}`
                }
            }

            const filter = filters.get(action)!;

            if (!filter.validate(body)) {
                return {
                    status: Number(process.env.STATUS_BAD_REQUEST!),
                    contentType: "text/plain",
                    body: `Incorrect body:\n\n${JSON.stringify(body)}`
                };
            }

            return await this.handleAction(filter, body, this.context);
        } else {
            throw "Routes or context not initialized!";
        }
    }
}