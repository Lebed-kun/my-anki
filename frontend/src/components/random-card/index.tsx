import React from "react";
import { useCards } from "./hooks";
import Card from "./card";
import Answer from "./answer";
import { ScreenTitle } from "../common";
import { useRouteMatch } from "react-router-dom";
import styles from "./index.module.css";

const RandomCard: React.FC = () => {
    const match = useRouteMatch<{ name: string }>("/deck/:name");
    const deckName = React.useMemo(
        () => {
            return match?.params.name;
        },
        [match?.params]
    );

    const { takeCard } = useCards(deckName);

    const [pending, setPending] = React.useState(false);
    const [front, setFront] = React.useState<string>();
    const [back, setBack] = React.useState<string>();
    const [error, setError] = React.useState<Error>();

    const fetchCard = React.useCallback(
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
        
    React.useEffect(
        () => {
            fetchCard();
        },
        [fetchCard]
    );

    const [answered, setAnswered] = React.useState(false);

    return (
        <>
            {
                pending ? (
                    <ScreenTitle>
                        Loading card...
                    </ScreenTitle>
                ) : (front && back) ? (
                    <div>
                        <div className={styles.row}>
                            <Card content={front} visible={true} />

                            <div style={{ width: "20px" }} />

                            <Card content={back} visible={answered} />
                        </div>

                        <div style={{ height: "20px" }} />

                        <Answer 
                            onSubmit={() => setAnswered(true)}
                        />

                        <button
                            onClick={() => {
                                setAnswered(false);
                                fetchCard();
                            }}
                            disabled={!answered}
                        >
                            Next
                        </button>
                    </div>
                ) : error ? (
                    <ScreenTitle>
                        Error occured: 
                        <br />
                        {error.message}
                    </ScreenTitle>
                ) : null
            }
        </>
    )
}

export default RandomCard;
