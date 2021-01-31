import { ServiceContext, Filter } from "../types";
import fs from "fs";
import path from "path";
import { corsHeaders } from "./cors";

enum CardSide {
    Front,
    Back
}

export class CardFilter implements Filter {
    public validate(body: any) {
        return (typeof body === "object") &&
            (typeof body.deck_name === "string") &&
            (typeof body.card_name === "string");
    }

    private async readCard(
        body: any, 
        context: ServiceContext, 
        cardSide: CardSide
    ) {
        const fileReadPromise: Promise<Buffer> = new Promise(
            (res, rej) => {
                fs.readFile(
                    path.join(
                        context.resourcesPath,
                        process.env.PATH_DECKS!,
                        body.deck_name,
                        body.card_name,
                        `${cardSide === CardSide.Back ? "back" : "front"}.html`,
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
        return await htmlBuffer.toString("utf-8");
    }

    public async execute(body: any, context: ServiceContext) {
        try {
            const [frontSide, backSide] = await Promise.all(
                [
                   this.readCard(body, context, CardSide.Front), 
                   this.readCard(body, context, CardSide.Back)
                ]
            );

            return {
                status: Number(process.env.STATUS_OK!),
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                },
                body: JSON.stringify({
                    front: frontSide,
                    back: backSide
                })
            }
        } catch (err) {
            return {
                status: Number(process.env.STATUS_BAD_REQUEST!),
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders
                },
                body: String(err.message)
            }
        }
    }
}
