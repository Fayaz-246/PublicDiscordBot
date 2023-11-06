const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete/purge the amount of messages specified")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to purge.")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const embed = new EmbedBuilder();
    const bot = interaction.guild.members.me;
    const mConfig = client.messageConfig;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.missingPermissionsText.replace(
                "{permission}",
                "ManageMessages"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
      return;
    }

    if (!bot.permissions.has(PermissionFlagsBits.ManageMessages)) {
      interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.botMissingPermissionsText.replace(
                "{permission}",
                "ManageMessages"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger("amount");
    const channel = interaction.channel;

    embed
      .setColor("#000000")
      .setDescription(
        `Succesfully purged **${amount} ${
          amount > 1 ? "messages" : "message"
        }**.`
      );

    channel.bulkDelete(amount, true).then(() => {
      interaction.reply({ embeds: [em] });
      setTimeout(() => interaction.deleteReply(), 5000);
    });
  },
};
