import { BACKEND_URL } from "../../constants";
import { GradeDict } from "../select-grade";
import { CardMeta } from "../../types";

export const fetchCardRefs = async (deckName: string): Promise<CardMeta[]> => {
    const res = await fetch(
        `${BACKEND_URL}/anki/deck-cards`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                name: deckName,
                supermemoOn: true
            })
        }
    );

    const json = await res.json();
    if (!Array.isArray(json)) {
        throw Error("Invalid response");
    }

    return json;
}

export const fetchCardSides = async (deckName: string, cardName: string) => {
    const res = await fetch(
        `${BACKEND_URL}/anki/card`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                deck_name: deckName,
                card_name: cardName
            })
        }
    );

    return res.json();
}

export const updateScores = async (deckName: string, cards: GradeDict) => {
    const body = await JSON.stringify({
        deck_name: deckName,
        cards
    });

    const resp = await fetch(
        `${BACKEND_URL}/anki/update-scores`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body
        }
    );

    return resp.json();
}
