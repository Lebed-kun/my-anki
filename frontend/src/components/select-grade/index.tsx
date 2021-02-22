import React from "react";

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

const grades: Grade[] = [0, 1, 2, 3, 4, 5];

export interface GradeDict {
    [cardName: string]: Grade;
}

interface Props {
    onChange: (v: Grade) => void;
}

const SelectGrade: React.FC<Props> = ({ onChange }) => {
    return (
        <div>
            <p>
                Grade:
            </p>

            <div>
                {grades.map(grade => (
                    <>
                        <label 
                            htmlFor="grade"
                        >
                            {grade}
                        </label>

                        <input 
                            type="radio"
                            name="grade"
                            value={grade.toString()}
                            onChange={(e) => onChange(Number(e.currentTarget.value) as any)}
                        />
                    </>
                ))}
            </div>
        </div>
    )
}

export default SelectGrade;
