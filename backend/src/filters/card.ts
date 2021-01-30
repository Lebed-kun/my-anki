import { ServiceContext, Filter } from "../types";
import fs from "fs";
import path from "path";

export class CardFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.deck_name === "string") &&
            (typeof body.card_name === "string");
    }

    public async execute(body: any, context: ServiceContext) {
        const fileReadPromise: Promise<Buffer> = new Promise(
            (res, rej) => {
                fs.readFile(
                    path.join(
                        context.resourcesPath,
                        process.env.DECKS_DIR!,
                        body.deck_name,
                        body.card_name
                    ),
                    (err, data) => {
                        if (err !== null) {
                            rej(err);
                        } else {
                            res(data);
                        }
                    }
                );
            }
        );

        const htmlBuffer = await Promise.resolve(fileReadPromise);
        const html = await htmlBuffer.toString("utf-8");

        return {
            status: Number(process.env.STATUS_OK!),
            contentType: "text/html",
            body: html
        }
    }
}
