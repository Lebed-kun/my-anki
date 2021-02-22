import { AnkiConfig } from "../types";

export enum TaskType {
    UpdateMigration
}

interface UpdateMigrationTask {
    migrationPath: string;
    ankiConfig: AnkiConfig;
}

export type TaskPayload = UpdateMigrationTask;

export interface Task {
    type: TaskType,
    payload?: TaskPayload,
}

export interface Action {
    execute(
        payload?: TaskPayload 
    ): Promise<any>
}