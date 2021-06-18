import { HookHandler, HookContext } from "../types";

export async function cors<T>(ctx: HookContext<T>) {
    ctx.response.headers = {
        ...ctx.response.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400"
    };
}
