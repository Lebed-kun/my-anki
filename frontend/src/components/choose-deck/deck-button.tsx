import React from "react";
import { useHistory } from "react-router";
import styles from "./deck-button.module.css";

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
        <div className={styles.wrapper}>
            <button onClick={onClick}>
                {title || deckName}
            </button>
        </div>
    )
}

export default DeckButton;
