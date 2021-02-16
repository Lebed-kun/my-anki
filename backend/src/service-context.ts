import { AnkiConfig, AnkiCardRef } from "./types";
import fs from "fs";
import path from "path";

export class ServiceContext {
    private _resourcesPath?: string;
    private _memConfig?: AnkiConfig;
    private _fallbackPage?: string;
    private _migrationPath?: string;

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

    public get migrationPath() {
        if (typeof this._migrationPath !== "undefined") {
            return this._migrationPath
        } else {
            throw "Migration path not initialized!"
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

    private unmarshallDecks(rawConfig: any): Map<string, Map<string, AnkiCardRef>> {
        const decks: Map<string, Map<string, AnkiCardRef>> = new Map();
        const rawDecks = rawConfig.decks;

        for (let deckName in rawDecks) {
            if (typeof (rawDecks[deckName]) !== "object") {
                throw `Object decks contain invalid anki ref list with name \"${deckName}\"!`;
            }

            const cards: Map<string, AnkiCardRef> = new Map();

            for (let cardName in rawDecks[deckName]) {
                const repetition = Number(rawDecks[deckName].repetition);
                if (!Number.isFinite(repetition)) {
                    throw `Repetition is not a number in deck "${deckName}" in card "${cardName}"`
                }

                const interval = Number(rawDecks[deckName].interval);
                if (!Number.isFinite(interval)) {
                    throw `Interval is not a number in deck "${deckName}" in card "${cardName}"`
                }

                const efactor = Number(rawDecks[deckName].efactor);
                if (!Number.isFinite(efactor)) {
                    throw `Efactor is not a number in deck "${deckName}" in card "${cardName}"`
                }

                const rawPassedAt = rawDecks[deckName].passed_at;
                const passedAt = rawPassedAt !== null ? 
                    new Date(rawDecks[deckName].passed_at) : 
                    undefined;
                if (
                    typeof passedAt !== "undefined" && 
                    Number.isNaN(passedAt.getTime())
                ) {
                    throw `passed_at is not a valid ISO date in deck "${deckName}" in card "${cardName}"`
                }
                
                cards.set(
                    cardName, 
                    {
                        repetition,
                        interval,
                        efactor,
                        passedAt
                    }
                );
            }

            decks.set(deckName, cards);
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
        const migrationPath = path.join(
            __dirname,
            "..",
            "..",
            process.env.PATH_MIGRATION!
        );

        const memConfig = this.setupConfig(resourcesPath);
        const fallbackPage = this.setupFallbackPage(resourcesPath);

        this._resourcesPath = resourcesPath;
        this._memConfig = memConfig;
        this._fallbackPage = fallbackPage;
        this._migrationPath = migrationPath;
    }
}