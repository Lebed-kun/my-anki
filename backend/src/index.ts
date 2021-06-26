import http from "http";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb";
import { App } from "./app";
import { State } from "./types";

import { cors } from "./hooks/cors";
import { parseJson, stringifyJson } from "./hooks/json";
import { createAnkiRoutes } from "./routes/anki";
import { createAuthRoutes } from "./routes/auth";

const main = async () => {
    const client = await MongoClient.connect(process.env.MONGODB_URL!);
    const db = client.db("anki");
    const resourcesPath = path.join(
        __dirname,
        "..",
        "..",
        process.env.PATH_RESOURCES!
    );

    const fallbackPage = await fs.promises.readFile(
        path.join(
            resourcesPath,
            process.env.PATH_GET_TEMPLATE!
        ),
        {
            encoding: "utf-8"
        }
    );

    const app = new App<State>();
    app.use(cors);
    app.use(parseJson);
    app.use(async (ctx) => {
        ctx.state.db = db;
        ctx.state.resourcesPath = resourcesPath;
        ctx.state.fallbackPage = fallbackPage;
    });
    app.use(createAnkiRoutes());
    app.use(createAuthRoutes());
    app.use(stringifyJson);

    const server = http.createServer(app.toReqListener());
    server.listen(
        process.env.PORT,
        () => {
            console.log(`Listening on port ${process.env.PORT}`);
        }
    );
}

main().catch(e => console.error(e));
