import { HookHandler, HookContext } from "./types";

interface PathInfo<T> {
    pathParts: string[];
    handler: HookHandler<T>;
}

interface PathsDict<T> {
    [method: string]: PathInfo<T>[];
}

export class Router<T> {
    private _prefix: string;
    private _paths: PathsDict<T>;

    constructor(prefix: string = "") {
        this._prefix = prefix;
        this._paths = {};
    }

    public hookHandler(method: string, path: string, handler: HookHandler<T>) {
        if (!this._paths[method]) {
            this._paths[method] = [];
        }

        this._paths[method].push(
            {
                pathParts: (this._prefix + path).split("/"),
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
            const routePaths: PathInfo<T>[] = this._paths[ctx.request.method];
            if (!routePaths.length) return;

            const [path, query] = ctx.request.url.split("?");
            const reqPathParts = path.split("/");
            let currentPath: PathInfo<T> | undefined = routePaths[0];
            let pathPtr = 0;
            let i = 0;

            const params: { [k: string]: string } = {};
            for (let reqPart of reqPathParts) {
                if (!currentPath) break;

                const routePart = currentPath.pathParts[i];
                if (routePart[0] === ":") {
                    params[routePart.slice(1)] = reqPart;
                } else if (reqPart !== routePart) {
                    currentPath = routePaths[++pathPtr];
                    i--;
                }

                i++;
            }

            if (currentPath) {
                ctx.request.params = params;

                const queryParams: { [k: string]: string } = {};
                let key = "";
                let value = "";
                let isReadingVal = false;
                for (let j = 0; j < query.length + 1; j++) {
                    if (j === query.length && !!key) {
                        queryParams[key] = !value ? "1" : value;
                    } else if (query[j] === "&" && !!key) {
                        queryParams[key] = !value ? "1" : value;
                        key = "";
                        value = "";
                        isReadingVal = false;
                    } else if (query[j] === "=") {
                        isReadingVal = true;
                    } else if (isReadingVal) {
                        value += query[j];
                    } else {
                        key += query[j];
                    }
                }

                ctx.request.query = queryParams;
                await currentPath.handler(ctx);
            }
        }
    }
}