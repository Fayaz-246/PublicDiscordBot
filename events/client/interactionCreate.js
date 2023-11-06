const { Events, Interaction, Client } = require("discord.js");
const verifySchema = require("../../schemas/verifySchema");

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      if (!interaction.inGuild())
        return interaction.reply("You can only use slash commands in guilds.");

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: client.messageConfig.interactionErrorText,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: client.messageConfig.interactionErrorText,
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === `verification-${interaction.guild.id}`) {
        const data = await verifySchema.findOne({
          GuildID: interaction.guild.id,
        });
        if (!data) return;
        await interaction.member.roles.add(data.Role);
        await interaction.reply({
          ephemeral: true,
          content: "You are now verified",
        });
      }
    }
  },
};
