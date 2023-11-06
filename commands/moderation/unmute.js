const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("The member to untimeout")
        .setRequired(true)
    )
    .setDescription("Untimeout a member"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const embed = new EmbedBuilder();
    const bot = interaction.guild.members.me;
    const mConfig = client.messageConfig;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.missingPermissionsText.replace(
                "{permission}",
                "ModerateMembers / TimeoutMembers"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
      return;
    }

    if (!bot.permissions.has(PermissionFlagsBits.ManageChannels)) {
      interaction.reply({
        embeds: [
          embed
            .setDescription(
              `${mConfig.error} **${mConfig.botMissingPermissionsText.replace(
                "{permission}",
                "ModerateMembers / TimeoutMembers"
              )}**`
            )
            .setColor(mConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
      return;
    }

    const { options } = interaction;
    const member = options.getMember("user");

    embed
      .setDescription(`***${member.user.username} was unmuted***`)
      .setColor("#000000");

    await member.timeout(null).then(interaction.reply({ embeds: [embed] }));
  },
};
