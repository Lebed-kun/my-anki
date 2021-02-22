import { BACKEND_URL } from "../../constants";
import { GradeDict } from "../select-grade";

export const fetchCardRefs = async (deckName: string) => {
    const res = await fetch(
        `${BACKEND_URL}/deck-cards`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: deckName
            })
        }
    );

    return res.json();
}

export const fetchCardSides = async (deckName: string, cardName: string) => {
    const res = await fetch(
        `${BACKEND_URL}/card`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
        `${BACKEND_URL}/update-scores`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body
        }
    );

    return resp.json();
}
