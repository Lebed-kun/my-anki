import React from "react";
import { useCard } from "./hooks";
import Card from "./card";
import Answer from "./answer";
import { ScreenTitle } from "../common";
import { useRouteMatch } from "react-router-dom";
import styles from "./index.module.css";

const RandomCard: React.FC = () => {
    const card = useCard();

    return (
        <>
            {
                card.pending ? (
                    <ScreenTitle>
                        Loading card...
                    </ScreenTitle>
                ) : (card.front && card.back) ? (
                    <div>
                        <div className={styles.row}>
                            <Card content={card.front} visible={true} />

                            <div style={{ width: "20px" }} />

                            <Card content={card.back} visible={card.answered} />
                        </div>

                        <div style={{ height: "20px" }} />

                        <Answer 
                            onSubmit={() => card.setAnswered(true)}
                        />

                        {
                            card.hasNextCard ? (
                                <button
                                    onClick={() => {
                                        card.setAnswered(false);
                                        card.fetchCard();
                                    }}
                                    disabled={!card.answered}
                                >
                                    Next
                                </button>
                            ) : null
                        }
                    </div>
                ) : card.error ? (
                    <ScreenTitle>
                        Error occured: 
                        <br />
                        {card.error.message}
                    </ScreenTitle>
                ) : null
            }
        </>
    )
}

export default RandomCard;
