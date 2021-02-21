import { Routes } from "../types";

import { CardFilter } from "./card";
import { DecksCardsFilter } from "./deck-cards";
import { DecksFilter } from "./decks";
import { GetTemplateFilter } from "./get-template";
import { CorsFilter } from "./cors";
import { UpdateScoresFilter } from "./update-scores";

const cors = new CorsFilter();

export const Router: Routes = new Map(
    [
        [
            "GET",
            new Map(
                [
                    ["", new GetTemplateFilter()]
                ]
            )
        ],
        [
            "POST",
            new Map(
                [
                    ["card", new CardFilter()],
                    ["deck-cards", new DecksCardsFilter()],
                    ["decks", new DecksFilter()],
                    ["update-scores", new UpdateScoresFilter()]
                ]
            )
        ],
        [
            "OPTIONS",
            new Map(
                [
                    ["card", cors],
                    ["deck-cards", cors],
                    ["decks", cors],
                    ["update-scores", cors]
                ]
            )
        ]
    ]
);
