import { Router } from "../../router";
import { State, User } from "../../types";

export const createAuthRoutes = () => {
    const router = new Router<State>("/auth");

    router.get("/confirm-email", async (ctx) => {
        const confirmationCode = ctx.request.query.confirm;
        if (typeof confirmationCode !== "string" || confirmationCode.length === 0) {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.headers = {
                ...ctx.response.headers,
                "Content-Type": "text/plain"
            };
            ctx.response.body = "Bad confirmation code";
            return;
        }

        const encodedRedirect = ctx.request.query.redirect;
        if (typeof encodedRedirect !== "string" || encodedRedirect.length === 0) {
            ctx.response.status = Number(process.env.STATUS_BAD_REQUEST!);
            ctx.response.headers = {
                ...ctx.response.headers,
                "Content-Type": "text/plain"
            };
            ctx.response.body = "Bad redirect link";
            return;
        }
        const redirect = decodeURIComponent(encodedRedirect);

        const users = ctx.state.db.collection<User>("users");
        const user = await users.findOne(
            {
                confirmationCode
            }
        );
        if (!user) {
            ctx.response.status = Number(process.env.STATUS_NOT_FOUND!);
            ctx.response.headers = {
                ...ctx.response.headers,
                "Content-Type": "text/plain"
            };
            ctx.response.body = "User with this confirmation code not found";
            return;
        }

        await users.updateOne(
            {
                confirmationCode
            },
            {
                $set: {
                    confirmed: true
                }
            }
        );

        // TODO: move redirect to context class or special function
        ctx.response.status = Number(process.env.STATUS_MOVED!);
        // TODO: incapsulate context fields into class
        ctx.response.headers = {
            ...ctx.response.headers,
            "Location": redirect,
        };
        ctx.response.body = "";
    });

    return router.toHook();
}
