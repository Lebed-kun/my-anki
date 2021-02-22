const fs = require("fs");
const path = require("path");

const migrationPath = path.join(
    __dirname,
    "..",
    process.env.PATH_RESOURCES,
    process.env.PATH_MIGRATION
);

const configPath = path.join(
    __dirname,
    "..",
    process.env.PATH_RESOURCES,
    process.env.PATH_CONFIG
);

function main() {
    const migrationContent = fs.readFileSync(migrationPath);
    fs.writeFileSync(configPath, migrationContent);
}

main();