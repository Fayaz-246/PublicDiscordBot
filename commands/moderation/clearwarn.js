const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionsBitField,
  Client,
} = require("discord.js");
const warnsSchema = require("../../schemas/warnSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clear warnings for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to clear warnings for")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const embed = new EmbedBuilder();
    const mConfig = client.messageConfig;
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    )
      return await interaction.reply({
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

    const user = interaction.options.getUser("user");
    const data = await warnsSchema.findOne({
      UserID: user.id,
      GuildID: interaction.guildId,
    });
    if (!data)
      return interaction.reply({
        ephemeral: true,
        content: "This user has no warnings",
      });

    const arrLength = data.Content.length;

    embed
      .setColor(mConfig.successEmbedColor)
      .setDescription(
        `${mConfig.success}  Cleared ${arrLength} ${
          arrLength > 1 ? "warnings" : "warning"
        } for ${user.username}`
      );
    data.Content = [];
    await data
      .save()
      .then(async () => await interaction.reply({ embeds: [embed] }));
  },
};
