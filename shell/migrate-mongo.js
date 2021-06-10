const MongoClient = require("mongodb").MongoClient;
const Db = require("mongodb").Db;
const fs = require("fs");
const path = require("path");

const readConfig = async () => {
    const content = await fs.promises.readFile(
        path.resolve(
            __dirname,
            "..",
            process.env.PATH_RESOURCES,
            process.env.PATH_CONFIG
        ),
        "utf-8"
    );

    return await JSON.parse(content);
}

const connectToMongo = async () => {
    return await MongoClient.connect(process.env.MONGODB_URL);
}

/**
 * 
 * @param {Db} dbConnection
 * @param {any} config 
 */
const insertDecks = async (dbConnection, config) => {
    const decks = config["deck_names"].map(
        e => ({
            uid: e,
            title: "",
            author: "admin"
        })
    );

    await dbConnection.collection("decks").insertMany(decks);
}

/**
 * 
 * @param {Db} dbConnection
 * @param {any} config 
 */
const insertCards = async (dbConnection, config) => {
    const cards = [];
    for (let deckName in config.decks) {
        const rawCards = config.decks[deckName];
        for (let cardName in rawCards) {
            cards.push({
                uid: cardName,
                title: "",
                author: "admin",
                deckUid: deckName,
                interval: rawCards[cardName].interval,
                repetition: rawCards[cardName].repetition,
                efactor: rawCards[cardName].efactor,
                passedAt: rawCards[cardName].passed_at
            })
        }
    }

    await dbConnection.collection("cards").insertMany(cards);
}

const main = async () => {
    const config = await readConfig();
    const client = await connectToMongo();
    const db = client.db("anki");

    await insertDecks(db, config);
    await insertCards(db, config);

    await client.close();
}

main().catch(e => console.error(e));
