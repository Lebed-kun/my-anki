import React from "react";
import { useCard } from "./hooks";
import Card from "./card";
import Answer from "./answer";
import { ScreenTitle, Fence } from "../common";
import styles from "./index.module.css";
import AnkiScreen from "./anki-screen";

const RandomCard: React.FC = () => {
    const card = useCard();

    return (
        <>
            <Fence visible={card.pending}>
                <ScreenTitle>
                    Loading card...
                </ScreenTitle>
            </Fence>

            <Fence visible={!!card.front && !!card.back}>
                <AnkiScreen
                    cardName={card.cardName ?? ""}
                    cardTitle={card.cardTitle ?? ""}
                    deckName={card.deckName ?? ""} 
                    front={card.front ?? ""}
                    back={card.back ?? ""}
                    answered={card.answered}
                    setAnswered={card.setAnswered}
                    hasNextCard={card.hasNextCard}
                    fetchCard={card.fetchCard}
                />
            </Fence>

            <Fence visible={!!card.error}>
                <ScreenTitle>
                    Error occured: 
                    <br />
                    {card.error?.message ?? ""}
                </ScreenTitle>
            </Fence>
        </>
    )
}

export default RandomCard;
