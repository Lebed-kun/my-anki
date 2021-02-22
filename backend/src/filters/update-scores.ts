import { ServiceContext, Filter, AnkiCardRef } from "../types";
import { corsHeaders } from "./cors";
import { supermemo, SuperMemoGradeDict } from "../utils/supermemo";
import { TaskType } from "../background/types";

export class UpdateScoresFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.deck_name === "string") &&
            (typeof body.cards === "object");
    }

    private updateDeck(
        deck: Map<string, AnkiCardRef>,
        deckCardGrades: SuperMemoGradeDict
    ) {
        for (let cardName in deckCardGrades) {
            const cardData = deck.get(cardName);

            if (cardData) {
                const nextAnkiData = supermemo(
                    {
                        interval: cardData.interval,
                        repetition: cardData.repetition,
                        efactor: cardData.efactor
                    },
                    deckCardGrades[cardName]
                );

                deck.set(
                    cardName,
                    {
                        ...nextAnkiData,
                        passedAt: new Date()
                    }
                )
            }
        }
    }

    public async execute(body: any, context: ServiceContext) {
        const deck = context.memConfig.decks.get(body.deck_name);

        if (typeof deck === "undefined") {
            return {
                status: Number(process.env.STATUS_NOT_FOUND!),
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders
                },
                body: `Deck named "${body.deck_name}" was not found!`
            }
        }
        
        this.updateDeck(
            deck,
            body.cards,
        );

        context.background.dispatch(
            {
                type: TaskType.UpdateMigration,
                payload: {
                    migrationPath: context.migrationPath,
                    ankiConfig: context.memConfig
                }
            }
        );

        return {
            status: Number(process.env.STATUS_OK!),
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders
            },
            body: JSON.stringify({
                success: true
            })
        }
    }
}
