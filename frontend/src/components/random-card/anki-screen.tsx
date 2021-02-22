import React from "react";
import Card from "./card";
import styles from "./index.module.css";
import Answer from "./answer";
import SelectGrade, { Grade, GradeDict } from "../select-grade";
import { updateScores } from "./api";
import { useHistory } from "react-router-dom";

interface Props {
    cardName: string;
    deckName: string;
    front: string;
    back: string;

    answered: boolean;
    setAnswered: (v: boolean) => void;
    
    hasNextCard: boolean;
    fetchCard: () => Promise<void>;
};

const AnkiScreen: React.FC<Props> = (props) => {
    const history = useHistory();
    const [grade, setGrade] = React.useState<Grade>(0);
    const grades = React.useRef<GradeDict>({});
    const refSetAnswer = React.useRef<(v: string) => void>();

    const onNext = React.useCallback(
        () => {
            props.setAnswered(false);
            props.fetchCard();

            grades.current[props.cardName] = grade;
            refSetAnswer.current?.("");
        },
        [props.setAnswered, props.fetchCard, props.cardName]
    );

    const onFinish = React.useCallback(
        () => {
            grades.current[props.cardName] = grade;

            updateScores(props.deckName, grades.current)
                .then(
                    () => history.push("/finish")
                )
                .catch(
                    err => console.error(err)
                );
        },
        [props.cardName, props.deckName]
    );

    return (
        <div>
            <div className={styles.row}>
                <Card content={props.front} visible={true} />

                <div style={{ width: "20px" }} />

                <Card content={props.back} visible={props.answered} />
            </div>

            <div style={{ height: "20px" }} />

            <Answer 
                onSubmit={() => props.setAnswered(true)}
                refSetValue={refSetAnswer}
            />

            <div style={{ height: "20px" }} />

            <SelectGrade 
                onChange={setGrade}
            />

            <div style={{ height: "20px" }} />
            
            {
                props.hasNextCard ? (
                    <button
                        onClick={onNext}
                        disabled={!props.answered}
                    >
                        Next
                    </button>
                ) : null
            }

            <button
                onClick={onFinish}
                disabled={!props.answered}
            >
                Finish
            </button>
        </div>
    )
};

export default AnkiScreen;