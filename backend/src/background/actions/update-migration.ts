import { Action, TaskPayload } from "../types";
import { AnkiConfig } from "../../types";
import fs from "fs";

export class UpdateMigrationAction implements Action {
    private unmapConfigDecks(
        config: AnkiConfig
    ): any {
        const decks: any = {};

        for (const [deckName, cards] of config.decks) {
            const deck = config.decks.get(deckName);
            let cards: any;

            if (deck) {
                cards = {};

                for (const [cardName, cardInfo] of deck) {
                    cards[cardName] = {
                        interval: cardInfo.interval,
                        repetition: cardInfo.repetition,
                        efactor: cardInfo.efactor,
                        passed_at: cardInfo.passedAt?.toISOString() ?? null
                    };
                }
            }

            if (cards) {
                decks[deckName] = cards;
            }
        }

        return decks;
    }
    
    private async stringifyConfig(
        config: AnkiConfig
    ): Promise<string> {
        const unmappedDecks = this.unmapConfigDecks(config);

        return await JSON.stringify(
            {
                deck_names: config.deckNames,
                decks: unmappedDecks
            },
            null,
            4
        );
    }
    
    public async execute(payload?: TaskPayload) {
        if (!payload) {
            throw "Migration path and anki config must be specified";
        } else {
            const stringConfig = await this.stringifyConfig(
                payload.ankiConfig
            );
    
            const fsPromise = new Promise(
                (res, rej) => {
                    fs.writeFile(
                        payload.migrationPath,
                        stringConfig,
                        err => {
                            if (err !== null) {
                                rej(err);
                            } else {
                                res();
                            }
                        }
                    )
                }
            );
    
            return await Promise.resolve(fsPromise);
        }
    }
}