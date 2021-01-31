import { BACKEND_URL } from "../../constants";

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