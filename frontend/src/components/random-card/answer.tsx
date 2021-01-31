import React from "react";

interface Props {
    onSubmit: (val: string) => void;
}

const Answer: React.FC<Props> = ({ onSubmit }) => {
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
    ) ;

    return (
        <div>
            <textarea 
                value={value} 
                onChange={onChange}
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
