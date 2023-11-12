const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set the slowmode for the current channel")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription(
          "Time in seconds if you want to remove the slowmode don't add time leave it blank"
        )
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(1000)
    ),
  async execute(interaction, client) {
    const mConfig = client.messageConfig;
    const embed = new EmbedBuilder();
    const bot = interaction.guild.members.me;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
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

    if (!bot.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.botMissingPermissionsText.replace(
                "{permission}",
                "ManageChannels"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
    }

    embed.setColor(mConfig.successEmbedColor);

    const channel = interaction.channel;
    let time = interaction.options.getInteger("time") || 0;
    const desc =
      time == 0
        ? `Removed slowmode for the current channel ${mConfig.success}`
        : `Set the slowmode for the current channel to **${time} seconds** ${mConfig.success}`;

    embed.setDescription(desc);

    await channel.setRateLimitPerUser(time).then(() => {
      interaction.reply({ embeds: [embed] });
    });
  },
};
