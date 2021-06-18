import fs from "fs";
import path from "path";
import { MongoClient, Db } from "mongodb";

export class ServiceContext {
    private _resourcesPath?: string;
    private _fallbackPage?: string;
    private _db?: Db;

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

        const fallbackPage = this.setupFallbackPage(resourcesPath);

        this._resourcesPath = resourcesPath;
        this._fallbackPage = fallbackPage;
        await this.setupDb();
    }
}