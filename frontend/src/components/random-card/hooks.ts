import { useState, useEffect, useCallback, useMemo } from "react";
import { RandStack } from "../../utils";
import { useForceUpdate } from "../../hooks";
import { useRouteMatch } from "react-router-dom";
import { fetchCardRefs, fetchCardSides } from "./api";

interface Card {
    front: string;
    back: string;
}

export const useCardsData = (deckName?: string) => {
    const forceUpdate = useForceUpdate();
    const [cardRefs, setCardRefs] = useState<RandStack<string>>();

    useEffect(
        () => {
            if (deckName) {
                fetchCardRefs(deckName).then(
                    cardRefs => {
                        const stack = new RandStack<string>(cardRefs)
                        setCardRefs(stack);
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
                    forceUpdate();

                    return cardSides
                }
            }
        },
        [deckName, cardRefs]
    );

    

    return { 
        takeCard,
        hasNextCard: !!cardRefs?.length
    };
}

export const useCard = () => {
    const match = useRouteMatch<{ name: string }>("/deck/:name");
    const deckName = useMemo(
        () => {
            return match?.params.name;
        },
        [match?.params]
    );

    const { takeCard, hasNextCard } = useCardsData(deckName);

    const [pending, setPending] = useState(false);
    const [front, setFront] = useState<string>();
    const [back, setBack] = useState<string>();
    const [error, setError] = useState<Error>();

    const fetchCard = useCallback(
        async () => {
            try {
                setPending(true);

                const sides = await takeCard();

                if (typeof sides !== "undefined") {
                    setFront(sides.front);
                    setBack(sides.back);
                }
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setPending(false);
            }
        },
        [takeCard]
    ) 
        
    useEffect(
        () => {
            fetchCard();
        },
        [fetchCard]
    );

    const [answered, setAnswered] = useState(false);

    return {
        answered,
        setAnswered,

        fetchCard,

        pending,
        front,
        back,
        error,

        hasNextCard
    };
}