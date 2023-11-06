const { REST, Routes } = require("discord.js");
const path = require("node:path");
const fs = require("node:fs");
require("colors");

module.exports = (foldersPath, commandFolders, client, token, clientId) => {
  const commands = [];
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command && !command.disabled) {
        console.log("[COMMAND]".green + ` Loaded ${command.data.name}`);
        const properties = { folder, ...command };
        client.commands.set(command.data.name, properties);

        commands.push(command.data.toJSON());
      } else if (command.disabled) {
        console.log(
          "⚠️" +
            ` Did not load ${command.data.name} as it is set to disabled`.yellow
        );
      } else {
        console.log(
          `⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
  const rest = new REST().setToken(token);

  (async () => {
    try {
      console.log(
        `🟡 Started refreshing ${commands.length} application (/) commands.`
          .yellow
      );

      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });

      console.log(
        `🟢 Successfully reloaded ${data.length} application (/) commands.`
          .green
      );
    } catch (error) {
      console.error(error);
    }
  })();
};
