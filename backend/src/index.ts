import http from "http";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb";
import { App } from "./app";
import { State } from "./types";

import { cors } from "./hooks/cors";
import { parseJson, stringifyJson } from "./hooks/json";
import { createAnkiRoutes } from "./routes/anki";

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
    app.use(stringifyJson);

    const server = http.createServer(app.toReqListener());
    server.listen(
        process.env.PORT,
        () => {
            console.log(`Listening on port ${process.env.PORT}`);
        }
    );

    /*
    const serviceContext = new ServiceContext();
    await serviceContext.init();

    const service = new Service(Router, serviceContext);

    const server = http.createServer(
        (req, res) => {
            const url = req.url ?? "";
            const method = req.method ?? "GET";
            const [, action] = url.split("/");
            const contentType = req.headers["content-type"] ?? "text/html";

            const rawRequestBody: Uint8Array[] = [];

            req.on("error", (err) => {
                console.error(err);
            }).on("data", (chunk) => {
                rawRequestBody.push(chunk);
            }).on("end", () => {
                const requestBody = Buffer.concat(rawRequestBody).toString();

                res.on("error", (err) => {
                    console.error(err);
                });

                service.exec(
                    method,
                    action,
                    contentType,
                    requestBody
                ).then(({ status, headers, body }) => {
                    res.writeHead(status, headers);
                    res.write(body);
                    res.end();
                }).catch(err => {
                    console.error(err);
                    res.end();
                });
            })
        }
    );

    server.listen(
        process.env.PORT,
        () => {
            console.log(`Listening on port ${process.env.PORT}`);
        }
    );
    */
}

main().catch(e => console.error(e));
