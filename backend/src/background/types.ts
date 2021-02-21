import { AnkiConfig } from "../types";

export enum TaskType {
    UpdateMigration
}

export interface UpdateMigrationTask {
    migrationPath: string;
    ankiConfig: AnkiConfig;
}

export interface Task {
    type: TaskType,
    payload?: UpdateMigrationTask,
}