import { useState, useEffect, useCallback } from "react";
import { RandStack } from "../../utils";
import { useForceUpdate } from "../../hooks";
import { fetchCardRefs, fetchCardSides } from "./api";

interface Card {
    front: string;
    back: string;
}

export const useCards = (deckName?: string) => {
    const forceUpdate = useForceUpdate();
    const [cardRefs, setCardRefs] = useState<RandStack<string>>();

    useEffect(
        () => {
            if (deckName) {
                fetchCardRefs(deckName).then(
                    cardRefs => {
                        setCardRefs(
                            new RandStack(cardRefs)
                        );
                    }
                ).catch(err => console.error(err));
            }
        },
        [deckName]
    );

    const takeCard = useCallback(
        async (): Promise<Card | undefined> => {
            if (
                (typeof cardRefs !== "undefined") &&
                (typeof deckName !== "undefined")
            ) {
                const cardName = cardRefs.pop();

                if (typeof cardName !== "undefined") {
                    const cardSides = await fetchCardSides(deckName, cardName);
                    
                    setCardRefs(cardRefs);
                    forceUpdate();

                    return cardSides
                }
            }
        },
        [deckName, cardRefs]
    );

    return { takeCard };
}