import { UpdateMigrationAction } from "./update-migration";
import { TaskType, Action } from "../types";

export const Actions: Map<TaskType, Action> = new Map(
    [
        [TaskType.UpdateMigration, new UpdateMigrationAction()]
    ]
);
