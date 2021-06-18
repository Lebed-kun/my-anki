import { HookHandler, HookContext } from "./types";
import { Fsm, Transition } from "./utils/fsm";

interface Recognizer {
    fsm: Fsm;
    clear: () => void;
    getValues: () => { [k: string]: string };
}

interface PathInfo<T> {
    recognizer: Recognizer;
    handler: HookHandler<T>;
}

interface PathsDict<T> {
    [method: string]: PathInfo<T>[];
}

enum QueryRecognizerState {
    IsReadingKey,
    IsReadingValue,
}

function createQueryRecognizer() {
    let queryDict: { [q: string]: string } = {};
    let buffKey = "";
    let buffVal = "";

    const commitQueryParam = (_1: string, _2: number) => {
        queryDict[buffKey] = buffVal || "1";
        buffKey = "";
        buffVal = "";
    };

    const queryFsm = new Fsm(
        QueryRecognizerState.IsReadingKey,
        {
            [QueryRecognizerState.IsReadingKey]: [
                {
                    condition: (s: string, i: number) => i < s.length && s[i] !== "=",
                    nextState: QueryRecognizerState.IsReadingKey,
                    effect: (s: string, i: number) => {
                        buffKey += s[i];
                    }
                },
                {
                    condition: (s: string, i: number) => s[i] === "=",
                    nextState: QueryRecognizerState.IsReadingValue,
                },
                {
                    condition: (s: string, i: number) => i === s.length,
                    nextState: QueryRecognizerState.IsReadingKey,
                    effect: commitQueryParam
                }
            ],
            [QueryRecognizerState.IsReadingValue]: [
                {
                    condition: (s: string, i: number) => i < s.length && s[i] !== "&",
                    nextState: QueryRecognizerState.IsReadingValue,
                    effect: (s: string, i: number) => {
                        buffVal += s[i];
                    }
                },
                {
                    condition: (s: string, i: number) => s[i] === "&" || i === s.length,
                    nextState: QueryRecognizerState.IsReadingKey,
                    effect: commitQueryParam,
                }
            ]

        }
    );

    const clearQuery = () => {
        queryDict = {};
    };

    const getQuery = () => {
        return queryDict;
    };

    return {
        fsm: queryFsm,
        clear: clearQuery,
        getValues: getQuery
    };
};

const queryRecognizer = createQueryRecognizer();

export class Router<T> {
    private _prefix: string;
    private _paths: PathsDict<T>;
    private _queryRecognizer: Recognizer;

    constructor(prefix: string = "") {
        this._prefix = prefix;
        this._paths = {};
        this._queryRecognizer = queryRecognizer;
    }

    private createPathRecognizer(path: string) {
        const pathFsm = new Fsm(0);

        let buffParam = "";
        let state = 0;
        let isMakerReadingParam = false;
        let paramsDict: { [p: string]: string } = {};
        for (let i = 0; i < path.length; i++) {
            if (path[i] === "/") {
                if (isMakerReadingParam) {
                    const param = buffParam;
                    pathFsm.addTransition(
                        state,
                        {
                            condition: (s: string, j: number) => j < s.length && s[j] !== path[i],
                            nextState: state,
                            effect: (s: string, j: number) => {
                                if (!paramsDict[param]) {
                                    paramsDict[param] = "";
                                }

                                paramsDict[param] += s[j];
                            }
                        }
                    );
                    buffParam = "";
                }

                pathFsm.addTransition(
                    state,
                    {
                        condition: (s: string, j: number) => s[j] === path[i],
                        nextState: ++state,
                    }
                );

                isMakerReadingParam = false;
            } else if (path[i] === ":") {
                isMakerReadingParam = true;
            } else if (isMakerReadingParam) {
                buffParam += path[i];
            } else {
                pathFsm.addTransition(
                    state,
                    {
                        condition: (s: string, j: number) => s[j] === path[i],
                        nextState: ++state
                    }
                )
            }
        }

        const clearPathParams = () => {
            paramsDict = {};
        };

        const getPathParams = () => {
            return paramsDict;
        };

        return {
            fsm: pathFsm,
            clear: clearPathParams,
            getValues: getPathParams
        }
    }

    public hookHandler(method: string, path: string, handler: HookHandler<T>) {
        if (!this._paths[method]) {
            this._paths[method] = [];
        }

        this._paths[method].push(
            {
                recognizer: this.createPathRecognizer(this._prefix + path),
                handler
            }
        );
    }

    public get(path: string, handler: HookHandler<T>) {
        this.hookHandler("GET", path, handler);
    }

    public post(path: string, handler: HookHandler<T>) {
        this.hookHandler("POST", path, handler);
    }

    public option(path: string, handler: HookHandler<T>) {
        this.hookHandler("OPTION", path, handler);
    }

    public toHook(): HookHandler<T> {
        return async (ctx: HookContext<T>) => {
            const paths = this._paths[ctx.request.method];
            if (!paths) throw `Unknown method ${ctx.request.method}`;

            const [path, query] = ctx.request.url.split("?");
            let handler: HookHandler<T> | null = null;
            for (let info of paths) {
                let failed = false;
                const recognizer = info.recognizer;

                recognizer.fsm.proceed(
                    path,
                    0,
                    (_: string, i: number) => {
                        failed = true;
                    },
                );

                if (!failed) {
                    ctx.request.params = recognizer.getValues();
                    recognizer.clear();

                    this._queryRecognizer.fsm.proceed(
                        query,
                        0,
                        (_1: string, _2: number) => {}
                    );
                    ctx.request.query = this._queryRecognizer.getValues();
                    this._queryRecognizer.clear();

                    handler = info.handler;
                    break;
                }
            }

            if (handler) {
                await handler(ctx);
            }
        }
    }
}