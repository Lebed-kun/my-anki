import { Task, TaskType } from "./types";
import { Actions } from "./actions";

export class Background {
    private async execute(task: Task) {
        const action = Actions.get(task.type);

        if (action) {
            await action.execute(task.payload);
        } else {
            throw "Unsupported action";
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