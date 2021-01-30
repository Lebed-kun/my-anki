import fs from "fs";
import path, { parse } from "path";
import http, { Server } from "http";

import { AnkiConfig, AnkiCardRef, ServiceContext } from "./types";

class Service {
    private context?: ServiceContext;

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

    public exec(action: string, body: any) {
        
    }
}