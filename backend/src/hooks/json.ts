import { HookHandler, HookContext } from "../types";

export async function parseJson<T>(ctx: HookContext<T>) {
    if (
        ctx.request.headers["content-type"] === "application/json" && 
        typeof ctx.request.body === "string"
    ) {
        ctx.request.body = await JSON.parse(ctx.request.body || "null");
    }
}

export async function stringifyJson<T>(ctx: HookContext<T>) {
    if (ctx.response.headers["content-type"] === "application/json") {
        ctx.response.body = await JSON.stringify(ctx.response.body);
    }
}
