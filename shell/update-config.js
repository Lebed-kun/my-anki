const fs = require("fs");
const path = require("path");

function readDirs(dirsPath, isDict) {
    const dirs = fs.readdirSync(dirsPath);
    const res = dirs.filter(dir => fs.statSync(path.join(dirsPath, dir)).isDirectory());

    if (!isDict) {
        return res;
    } else {
        return res.reduce(
            (acc, curr) => {
                return {
                    ...acc,
                    [curr]: true
                }
            },
            {}
        );
    }
}

const configPath = path.join(
    __dirname,
    "..",
    process.env.PATH_RESOURCES,
    process.env.PATH_CONFIG
);

function readConfig() {
    const configContent = fs.readFileSync(configPath);
    return JSON.parse(configContent);
}

const decksPath = path.join(
    __dirname,
    "..",
    process.env.PATH_RESOURCES,
    process.env.PATH_DECKS
);

function readDecks() {
    return readDirs(decksPath, true);
}

function readCards(deckName) {
    return readDirs(
        path.join(
            decksPath,
            deckName
        ),
        true
    );
}

function composeConfig() {
    const config = readConfig();
    const decks = readDecks();
    const decksArray = [];

    for (let deck in decks) {
        decksArray.push(deck);
        decks[deck] = readCards(deck);

        // 1. Check if there aren't current
        // deck in file
        if (!config.decks[deck]) {
            config.decks[deck] = {};
        }

        // 2. Check if some cards are not present
        // in current config
        for (let cardName in decks[deck]) {
            if (!config.decks[deck][cardName]) {
                config.decks[deck][cardName] = {
                    repetition: 0,
                    interval: 0,
                    efactor: 2.5,
                    passed_at: null
                }
            }
        }
    }

    // 3. Check for config decks
    // not present in decks folder
    for (let deck in config.decks) {
        if (!decks[deck]) {
            delete config.decks[deck];
            continue;
        }

        for (let card in config.decks[deck]) {
            if (!decks[deck][card]) {
                delete config.decks[deck][card];
            }
        }
    }

    return {
        deck_names: decksArray,
        decks: config.decks
    }
}

function saveConfig(config) {
    fs.writeFileSync(
        path.join(
            __dirname,
            "..",
            process.env.PATH_RESOURCES,
            process.env.PATH_CONFIG
        ),
        JSON.stringify(
            config,
            null,
            4
        )
    );
}

function main() {
    const config = composeConfig();
    saveConfig(config);
}

main();