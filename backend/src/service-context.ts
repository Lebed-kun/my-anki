import { AnkiConfig, AnkiCardRef } from "./types";
import fs from "fs";
import path from "path";
import { Background } from "./background";
import { MongoClient, Db } from "mongodb";

export class ServiceContext {
    private _resourcesPath?: string;
    private _fallbackPage?: string;
    private _migrationPath?: string;
    private _background?: Background;
    private _db?: Db;

    public get background() {
        if (typeof this._background !== "undefined") {
            return this._background
        } else {
            throw "Background not initialized!"
        }
    }

    public get resourcesPath() {
        if (typeof this._resourcesPath !== "undefined") {
            return this._resourcesPath
        } else {
            throw "Resources path not initialized!"
        }
    }

    public get fallbackPage() {
        if (typeof this._fallbackPage !== "undefined") {
            return this._fallbackPage
        } else {
            throw "Default page not initialized!"
        }
    }

    public get migrationPath() {
        if (typeof this._migrationPath !== "undefined") {
            return this._migrationPath
        } else {
            throw "Migration path not initialized!"
        }
    }

    private setupFallbackPage(resourcesPath: string): string {
        const rawContent = fs.readFileSync(
            path.join(
                resourcesPath,
                process.env.PATH_GET_TEMPLATE!
            )
        );


        return rawContent.toString("utf-8");
    }

    private async setupDb() {
        const client = await MongoClient.connect(process.env.MONGODB_URL!);
        this._db = client.db(process.env.DB_NAME!);
    }

    public get db(): Db {
        if (!this._db) {
            throw "Db not initialized";
        }

        return this._db;
    }

    public async init() {
        const resourcesPath = path.join(
            __dirname,
            "..",
            "..",
            process.env.PATH_RESOURCES!
        );
        const migrationPath = path.join(
            __dirname,
            "..",
            "..",
            process.env.PATH_RESOURCES!,
            process.env.PATH_MIGRATION!
        );

        // const memConfig = this.setupConfig(resourcesPath);
        const fallbackPage = this.setupFallbackPage(resourcesPath);

        this._resourcesPath = resourcesPath;
        // this._memConfig = memConfig;
        this._fallbackPage = fallbackPage;
        this._migrationPath = migrationPath;
        this._background = new Background();
        await this.setupDb();
    }
}