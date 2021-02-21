import { Queue } from "../utils/queue";
import { Task, TaskType } from "./types";
import { AnkiConfig } from "../types";
import fs from "fs";
import path from "path";

export class Background {
    private async updateMigration(
        migrationPath: string,
        ankiConfig: AnkiConfig
    ) {
        const fsPromise = new Promise(
            (res, rej) => {
                fs.writeFile(
                    migrationPath,
                    JSON.stringify(
                        ankiConfig,
                        null,
                        4
                    ),
                    err => {
                        if (err !== null) {
                            rej(err);
                        } else {
                            res();
                        }
                    }
                )
            }
        );

        return await Promise.resolve(fsPromise);
    }

    private async execute(task: Task) {
        if (
            task.type === TaskType.UpdateMigration &&
            task.payload
        ) {
            await this.updateMigration(
                task.payload.migrationPath,
                task.payload.ankiConfig
            );
        } else {
            throw "Unsupported task type"
        }
    }

    public dispatch(task: Task) {
        setTimeout(
            () => {
                this.execute(task).catch(
                    err => console.error(err)
                )
            }
        );
    }
}