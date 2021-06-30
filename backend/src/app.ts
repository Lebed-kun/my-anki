import { HookContext, HookHandler, BasicState } from "./types";
import { RequestListener, IncomingMessage, ServerResponse } from "http";

export class App<T extends BasicState> {
    private _hooks: HookHandler<T>[];
    private static DEFAULT_METHOD = process.env.DEFAULT_METHOD!;
    private static DEFAULT_STATUS = process.env.DEFAULT_STATUS!;

    constructor() {
        this._hooks = [];
    }

    public use(handler: HookHandler<T>) {
        this._hooks.push(handler);
    }

    private async proceedHandlers(ctx: HookContext<T>) {
        for (const h of this._hooks) {
            try {
                await h(ctx);
            } catch (e) {
                console.error(e);
            }
        }
    }

    public toReqListener(): RequestListener {
        return (req: IncomingMessage, res: ServerResponse) => {
            const rawRequestBody: Uint8Array[] = [];

            const context: HookContext<T> = {
                request: {
                    method: req.method ?? App.DEFAULT_METHOD,
                    url: req.url ?? "/",
                    params: {},
                    query: {},
                    headers: req.headers,
                    body: null
                },
                response: {
                    status: Number(App.DEFAULT_STATUS),
                    headers: {},
                    body: null
                },
                // @ts-ignore
                state: {
                    _handlerProceed: false
                }
            };

            req.on("error", (err) => {
                console.error(err);
                res.writeHead(Number(process.env.STATUS_SERVER_ERROR!));
                res.write(err.message);
                res.end();
            }).on("data", (chunk) => {
                rawRequestBody.push(chunk);
            }).on("end", () => {
                const body = Buffer.concat(rawRequestBody).toString();
                context.request.body = body;

                res.on("error", (err) => {
                    console.error(err);
                });

                this.proceedHandlers(context)
                    .then(
                        () => {
                            res.writeHead(
                                context.response.status,
                                context.response.headers
                            );
                            res.write(context.response.body || "");
                        }
                    )
                    .catch(
                        e => {
                            console.error(e);
                            res.writeHead(Number(App.DEFAULT_STATUS));
                            res.write(JSON.stringify(e));
                        }
                    )
                    .finally(
                        () => {
                            res.end();
                        }
                    );
            })
        }
    } 
}
