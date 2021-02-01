const fs = require("fs");
const path = require("path");

function readDirs(dirsPath) {
    const dirs = fs.readdirSync(dirsPath);

    return dirs.filter(dir => fs.statSync(path.join(dirsPath, dir)).isDirectory())
}

const decksPath = path.join(
    __dirname,
    "..",
    process.env.PATH_RESOURCES,
    process.env.PATH_DECKS
);

function readDecks() {
    return readDirs(decksPath);
}

function readCards(deckName) {
    return readDirs(
        path.join(
            decksPath,
            deckName
        )
    );
}

function readConfig() {
    const decks = readDecks();

    const cardsByDeck = {};

    decks.forEach(deck => {
        cardsByDeck[deck] = readCards(deck);
    });

    return {
        deck_names: decks,
        decks: cardsByDeck
    };
}

function saveConfig(config) {
    fs.writeFileSync(
        path.join(
            __dirname,
            "..",
            process.env.PATH_RESOURCES,
            process.env.PATH_CONFIG
        ),
        JSON.stringify(config)
    );
}

function main() {
    const config = readConfig();
    saveConfig(config);
}

main();
