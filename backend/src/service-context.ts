import { AnkiConfig, AnkiCardRef } from "./types";
import fs from "fs";
import path from "path";

export class ServiceContext {
    private _resourcesPath?: string;
    private _memConfig?: AnkiConfig;
    private _fallbackPage?: string;

    public get resourcesPath() {
        if (typeof this._resourcesPath !== "undefined") {
            return this._resourcesPath
        } else {
            throw "Resources path not initialized!"
        }
    }

    public get memConfig() {
        if (typeof this._memConfig !== "undefined") {
            return this._memConfig
        } else {
            throw "Config not initialized!"
        }
    }

    public get fallbackPage() {
        if (typeof this._fallbackPage !== "undefined") {
            return this._fallbackPage
        } else {
            throw "Default page not initialized!"
        }
    }

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
                process.env.PATH_CONFIG!
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
                process.env.PATH_GET_TEMPLATE!
            )
        );


        return rawContent.toString("utf-8");
    }

    public init() {
        const resourcesPath = path.join(
            __dirname,
            "..",
            "..",
            process.env.PATH_RESOURCES!
        );
        const memConfig = this.setupConfig(resourcesPath);
        const fallbackPage = this.setupFallbackPage(resourcesPath);

        this._resourcesPath = resourcesPath;
        this._memConfig = memConfig;
        this._fallbackPage = fallbackPage;
    }
}