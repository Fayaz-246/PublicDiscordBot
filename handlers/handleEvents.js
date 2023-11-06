const fs = require("fs");

module.exports = (client, eventFolders) => {
  for (const event of eventFolders) {
    const eventFiles = fs
      .readdirSync(`./events/${event}`)
      .filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
      const eventE = require(`../events/${event}/${file}`);
      console.log(
        "[CLIENT EVENTS]".magenta +
          ` Loaded ${capitalizeFirstLetter(event)} Event - ${eventE.name}!`
      );
      if (eventE.once) {
        client.once(eventE.name, (...args) => eventE.execute(...args, client));
      } else {
        client.on(eventE.name, (...args) => eventE.execute(...args, client));
      }
    }
  }
};

function capitalizeFirstLetter(inputString) {
  return `${inputString.charAt(0).toUpperCase()}${inputString.slice(1)}`;
}
