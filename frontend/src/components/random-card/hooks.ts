import { useState, useEffect, useCallback, useMemo } from "react";
import { RandStack } from "../../utils";
import { useForceUpdate } from "../../hooks";
import { useRouteMatch, useHistory } from "react-router-dom";
import { fetchCardRefs, fetchCardSides } from "./api";

interface Card {
    front: string;
    back: string;
}

interface CardInfo {
    name: string;
    content: Card;
}

export const useCardsData = (deckName?: string) => {
    const forceUpdate = useForceUpdate();
    const [cardRefs, setCardRefs] = useState<RandStack<string>>();
    const [initRefsCount, setInitRefsCount] = useState<number>();

    useEffect(
        () => {
            if (deckName) {
                fetchCardRefs(deckName).then(
                    cardRefs => {
                        const stack = new RandStack<string>(cardRefs);
                        setCardRefs(stack);
                        setInitRefsCount(stack.length);
                    }
                ).catch(err => console.error(err));
            }
        },
        [deckName]
    );

    const takeCard = useCallback(
        async (): Promise<CardInfo | undefined> => {
            if (
                (typeof cardRefs !== "undefined") &&
                (typeof deckName !== "undefined")
            ) {
                const cardName = cardRefs.pop();

                if (typeof cardName !== "undefined") {
                    const cardSides = await fetchCardSides(deckName, cardName);
                    forceUpdate();

                    return { 
                        name: cardName,
                        content: cardSides
                     }
                }
            }
        },
        [deckName, cardRefs]
    );

    return { 
        takeCard,
        hasNextCard: !!cardRefs?.length,
        initRefsCount
    };
}

export const useCard = () => {
    const match = useRouteMatch<{ name: string }>("/deck/:name");
    const history = useHistory();
    const deckName = useMemo(
        () => {
            return match?.params.name;
        },
        [match?.params]
    );

    const { takeCard, hasNextCard, initRefsCount } = useCardsData(deckName);

    const [pending, setPending] = useState(false);
    const [front, setFront] = useState<string>();
    const [back, setBack] = useState<string>();
    const [cardName, setCardName] = useState<string>();
    const [error, setError] = useState<Error>();

    const fetchCard = useCallback(
        async () => {
            if (typeof initRefsCount !== "undefined") {
                try {
                    if (initRefsCount < 1) {
                        history.push("/finish");
                        return;
                    }

                    setPending(true);
                    const info = await takeCard();
    
                    if (typeof info !== "undefined") {
                        setCardName(info.name);
                        setFront(info.content.front);
                        setBack(info.content.back);
                    }
                } catch (err) {
                    console.error(err);
                    setError(err);
                } finally {
                    setPending(false);
                }
            }
        },
        [takeCard, initRefsCount]
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
        cardName,
        deckName,
        front,
        back,
        error,

        hasNextCard
    };
}