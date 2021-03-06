import React from "react";
import styles from "./answer.module.css";

interface Props {
    onSubmit: (val: string) => void;
    refSetValue: React.MutableRefObject<((v: string) => void) | undefined>;
}

const Answer: React.FC<Props> = ({ onSubmit, refSetValue }) => {
    const [value, setValue] = React.useState("");
    
    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(e.currentTarget.value);
        },
        []
    );

    const onRawSubmit = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            onSubmit(e.currentTarget.value);
        },
        [onSubmit]
    );

    React.useEffect(
        () => {
            refSetValue.current = setValue;
        },
        []
    );

    return (
        <div className={styles.answer}>
            <textarea 
                value={value} 
                onChange={onChange}
                className={styles.input}
            >
            </textarea>

            <button 
                onClick={onRawSubmit}
                disabled={value.length === 0}
            >
                Submit
            </button>
        </div>
    )
}

export default Answer;
