import fs from "fs";
import path, { parse } from "path";
import http from "http";

import { AnkiConfig, AnkiCardRef } from "./types";

class Service {
    private memConfig?: AnkiConfig;

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

    private setupConfig(configName: string) {
        const rawContent = fs.readFileSync(
            path.resolve(__dirname, configName)
        );
        
        const parsedContent = JSON.parse(rawContent.toString("utf-8")); 
        this.shallowValidateConf(parsedContent);

        const deckNames = this.unmarshallDeckNames(parsedContent);
        const decks = this.unmarshallDecks(parsedContent);
        
        this.memConfig = {
            deckNames,
            decks
        };
    }

    private setupServer() {
        
    }

    public init(configName: string): Service {
        try {
            this.setupConfig(configName);
        } catch (err) {

        } finally {
            return this;
        }
    }
}