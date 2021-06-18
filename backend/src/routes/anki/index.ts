import { Router } from "../../router";

export const createAnkiRoutes = () => {
    const router = new Router("/anki");

    router.get("/decks", async (ctx) => {
        
    });

    return router.toHook();
}
