const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const schema = require("../../schemas/verifySchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Setup the verify system")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Setup the verification system")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The verified role")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "The channel where the verification message will be sent"
            )
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("Disable the verification system")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const { options, member } = interaction;
    const gID = interaction.guild.id;
    const mConfig = client.messageConfig;
    if (!member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({
        embeds: [
          new EmbedBuilder.setDescription(
            `${mConfig.error} **${mConfig.missingPermissionsText.replace(
              "{permission}",
              "Administrator"
            )}**`
          ).setColor(client.messageConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
    const bot = interaction.guild.members.me;
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${mConfig.error} **${mConfig.botMissingPermissionsText.replace(
                "{permission}",
                "ManageRoles"
              )}**`
            )
            .setColor(client.messageConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });

    await interaction.deferReply({ ephemeral: true });
    const subCommand = options.getSubcommand(true);
    switch (subCommand) {
      case "setup":
        const verifiedRole = options.getRole("role");
        const channel = options.getChannel("channel") ?? interaction.channel;
        if (verifiedRole.position > bot.roles.highest.position)
          return interaction.reply({
            ephemeral: true,
            content: `The role \`${verifiedRole}\` is higher than mine, so I cannot add it to users.`,
          });

        const data = await schema.findOne({ GuildID: gID });
        if (data) {
          await schema.findOneAndUpdate(
            { GuildID: gID },
            {
              GuildID: gID,
              Role: verifiedRole.id,
            }
          );
          await data.save();
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`verification-${gID}`)
              .setLabel("Verify")
              .setStyle(ButtonStyle.Primary)
          );
          const embed = new EmbedBuilder()
            .setColor(mConfig.embedColor)
            .setDescription(
              `This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button.`
            );

          const msg = await channel.send({
            embeds: [embed],
            components: [row],
          });
          await interaction.editReply({
            embeds: [new EmbedBuilder().setDescription(`Done ${msg.url}`)],
          });
        } else {
          const newData = new schema({ GuildID: gID, Role: verifiedRole.id });
          await newData.save();
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`verification-${gID}`)
              .setLabel("Verify")
              .setStyle(ButtonStyle.Primary)
          );
          const embed = new EmbedBuilder()
            .setColor(mConfig.embedColor)
            .setDescription(
              `This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button.`
            );

          const msg = await channel.send({
            embeds: [embed],
            components: [row],
          });
          await interaction.editReply({
            embeds: [new EmbedBuilder().setDescription(`Done ${msg.url}`)],
          });
        }
        break;

      case "disable":
        const Disableddata = await schema.findOne({ GuildID: gID });
        if (!Disableddata)
          return interaction.editReply(
            `Verifiaction system is not setup in ${interaction.guild.name}`
          );
        await schema
          .findOneAndDelete({ GuildID: gID })
          .then(async () =>
            interaction.editReply("Disabled verification system")
          );
        break;
      default:
        break;
    }
  },
};
