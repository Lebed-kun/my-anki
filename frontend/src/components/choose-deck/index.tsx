import React from "react";
import { ScreenTitle } from "../common";
import { BACKEND_URL } from "../../constants";
import DeckButton from "./deck-button";
import { Deck } from "../../types";

const fetchDecks = async (): Promise<Deck[]> => {
    const res = await fetch(
        `${BACKEND_URL}/anki/decks`,
        {
            method: "GET",
            headers: {
                "content-type": "application/json"
            }
        }
    );

    const data = await res.json();
    if (!Array.isArray(data)) {
        throw Error("Invalid response");
    }

    return data;
};

const ChooseDeck: React.FC = () => {
    const [pending, setPending] = React.useState(false);
    const [decks, setDecks] = React.useState<Deck[]>();
    const [error, setError] = React.useState<Error>();

    React.useEffect(
        () => {
            setPending(true);

            fetchDecks().then(
                data => {
                    setDecks(data);    
                }
            ).catch(
                err => {
                    setError(err);
                })
            .finally(
                () => {
                    setPending(false);
                }
            )
        },
        []
    );

    return (
        <>
            {
                pending ? (
                    <ScreenTitle>
                        Loading decks...
                    </ScreenTitle>
                ) : decks ? (
                    <>
                        <ScreenTitle>
                            Choose deck
                        </ScreenTitle>

                        {decks.map(
                            deck => (
                                <DeckButton 
                                    deckName={deck.uid}
                                    title={deck.title}
                                />
                            )
                        )}
                    </>
                ) : error ? (
                    <>
                        <ScreenTitle>
                            Error during loading decks:
                        </ScreenTitle>

                        <p>
                            {error.message}
                        </p>
                    </>
                ) : null
            }
        </>
    ) 
}

export default ChooseDeck;
