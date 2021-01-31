import React from "react";
import { ScreenTitle } from "../common";
import { BACKEND_URL } from "../../constants";
import DeckButton from "./deck-button";

const fetchDecks = async () => {
    const res = await fetch(
        `${BACKEND_URL}/decks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    const data = await res.json();
    
    return data;
};

const ChooseDeck: React.FC = () => {
    const [pending, setPending] = React.useState(false);
    const [deckNames, setDeckNames] = React.useState<string[]>();
    const [error, setError] = React.useState<Error>();

    React.useEffect(
        () => {
            setPending(true);

            fetchDecks().then(
                data => {
                    setDeckNames(data);    
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
                ) : deckNames ? (
                    <>
                        <ScreenTitle>
                            Choose deck
                        </ScreenTitle>

                        {deckNames.map(
                            name => (
                                <DeckButton 
                                    deckName={name}
                                    title={name}
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
