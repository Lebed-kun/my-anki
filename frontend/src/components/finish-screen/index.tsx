import React from "react";
import { useHistory } from "react-router-dom";
import styles from "./index.module.css";
import { ScreenTitle } from "../common";

const FinishScreen: React.FC = () => {
    const history = useHistory();

    return (
        <div className={styles.wrapper}>
            <ScreenTitle>
                Come back to decks
            </ScreenTitle>

            <div style={{ height: "20px" }}/>

            <div>
                <button
                    onClick={() => history.push("/")}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default FinishScreen;
