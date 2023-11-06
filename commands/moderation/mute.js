const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
} = require("discord.js");
const getTimeInMilliseconds = require("../../utils/getTimeInMiliseconds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .addUserOption((opt) =>
      opt.setName("member").setDescription("User to mute").setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("limit")
        .setDescription("Duration of the timeout (e.g., 5m, 1s, 2h, 8d)")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the mute")
    )
    .setDescription("Timeout a member so they cannot type"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const member = interaction.options.getMember("member");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const time = interaction.options.getString("limit");
    const embed = new EmbedBuilder();
    const mConfig = client.messageConfig;
    const bot = interaction.guild.members.me;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.missingPermissionsText.replace(
                "{permission}",
                "ManageRoles"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
    }

    if (!bot.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.botMissingPermissionsText.replace(
                "{permission}",
                "ManageRoles"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You cannot mute someone with a higher or equal role.",
        ephemeral: true,
      });
    }

    const timeSuffix = time.slice(-1).toLowerCase();
    const timeValue = parseInt(time.slice(0, -1));
    const timeMS = getTimeInMilliseconds(timeValue, timeSuffix);

    if (!timeMS) {
      return interaction.reply({
        content:
          "Invalid time format. Use '5m' for 5 minutes, '1h' for 1 hour, etc.",
        ephemeral: true,
      });
    }

    try {
      await member.timeout(timeMS, reason);
      embed
        .setDescription(
          `${mConfig.success}***${member.user.username} was muted***`
        )
        .setColor(mConfig.successEmbedColor);
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({
        embeds: [
          embed
            .setColor(mConfig.errorEmbedColor)
            .setDescription("**An error occured while timing out the user.**"),
        ],
        ephemeral: true,
      });
    }
  },
};
