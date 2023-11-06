require("colors");
const { Events, Client } = require("discord.js");
const mongo = require("mongoose");
const { mongoURI } = require("../../configs/config.json");

module.exports = {
  name: Events.ClientReady,
  once: true,
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    console.log(
      `Loggged in as ${client.user.tag} || ID: ${client.user.id} || Current Ping: ${client.ws.ping}ms`
        .cyan
    );
    // Mongo
    if (!mongoURI) return;
    mongo.connect(mongoURI);

    mongo.connection.on("connected", () => {
      console.log("[DATABASE]".green + " Connected");
    });

    mongo.connection.on("disconnected", () => {
      console.log("[DATABASE]".yellow + " Disconnected");
    });

    mongo.connection.on("err", (err) => {
      console.log("[DATABASE] ERROR".red, err);
    });
  },
};
