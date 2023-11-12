require("colors");
const {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
} = require("discord.js");
const { clientId, token } = require("./configs/config.json");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials),
});
client.commands = new Collection();
client.messageConfig = require("./configs/messageConfig.js");

client.login(token);

// Events load
const eventFolders = fs.readdirSync(`./events`);

require("./handlers/handleEvents")(client, eventFolders);

// Commands load

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

require("./handlers/handleCommands")(
  foldersPath,
  commandFolders,
  client,
  token,
  clientId
);

// Error Handling
process.on("unhandledRejection", async (reason, promise) => {
  console.log("Unhandled Rejection at: ".red, promise, "reason: ", reason);
});

process.on("uncaughtException", async (error) => {
  console.log("Uncaught Exception at: ".red, error);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
  console.log("Uncaught Exception Monitor: ".red, err, origin);
});

/* ---------------------------------- */
process.on("exit", async () => {
  await client.destroy();
});
