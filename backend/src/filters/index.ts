import { Routes } from "../types";

import { CardFilter } from "./card";
import { DecksCardsFilter } from "./deck-cards";
import { DecksFilter } from "./decks";
import { GetTemplateFilter } from "./get-template";

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
                ]
            )
        ]
    ]
);
