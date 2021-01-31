import http from "http";
import { Router } from "./filters";
import { Service } from "./service";
import { ServiceContext } from "./service-context";

const serviceContext = new ServiceContext();
serviceContext.init();

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
