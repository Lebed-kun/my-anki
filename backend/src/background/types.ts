import { AnkiCardRef } from "../types";
import { SuperMemoGrade } from "../utils/supermemo";

export enum TaskType {
    UpdateCard
}

interface UpdateTask {
    cardName: string;
    nextAnkiData: AnkiCardRef;
}

export interface Task {
    type: TaskType,
    payload: UpdateTask
}