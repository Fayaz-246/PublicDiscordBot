const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  Events,
} = require("discord.js");
const config = require("../../configs/config.json");

module.exports = {
  disabled: true,
  data: new SlashCommandBuilder()
    .setName("emit")
    .setDescription("Emit a event")
    .addStringOption((o) =>
      o
        .setName("event")
        .setDescription("The event to emit")
        .addChoices(
          { name: "GuildMemberAdd", value: Events.GuildMemberAdd },
          { name: "GuildMemberRemove", value: Events.GuildMemberRemove }
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    if (interaction.user.id != config.ownerId)
      return await interaction.reply({
        content: "Owner only command",
        ephemeral: true,
      });
    await client.emit(
      interaction.options.getString("event"),
      interaction.member
    );
  },
};
