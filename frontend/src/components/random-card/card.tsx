import React from "react";
import styles from "./card.module.css";

interface Props {
    content: string;
    visible: boolean;
}

const Card: React.FC<Props> = ({ content, visible }) => {
    return (
        <div 
            dangerouslySetInnerHTML={{ __html: content }}
            className={!visible ? styles.invisible : ""}
        />
    )
}

export default Card;
