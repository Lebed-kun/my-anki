import React from "react";
import { useHistory } from "react-router";

interface Props {
    deckName: string;
    title: string;
}

const DeckButton: React.FC<Props> = ({ deckName, title }) => {
    const history = useHistory();
    
    const onClick = React.useCallback(
        () => {
            history.push(
                `/deck/${deckName}`
            );
        },
        [deckName]
    );
    
    return (
        <button onClick={onClick}>
            {title}
        </button>
    )
}

export default DeckButton;
