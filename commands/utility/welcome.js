const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const welcomeSchema = require("../../schemas/welcomeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Setup the welcome system")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Setup the welcome system")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel for the welcome messages to be sent")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("channel-message")
            .setDescription(
              "The welcome message to send in the channel, you can use {tag}, {user} and {mention}"
            )
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("dm-message")
            .setDescription(
              "The welcome message to send the member, you can use {tag}, {user} and {mention}"
            )
        )
    )
    .addSubcommandGroup((subGroup) =>
      subGroup
        .setName("edit")
        .setDescription("Edit the welcome system")
        .addSubcommand((sub) =>
          sub
            .setName("channel")
            .setDescription("Change the welcome channel")
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription(
                  "The channel for the welcome messages to be sent"
                )
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("channel-message")
            .setDescription("Change the message sent in the welcome channel")
            .addStringOption((opt) =>
              opt
                .setName("channel-message")
                .setDescription(
                  "The welcome message to send in the channel, you can use {tag}, {user} and {mention}"
                )
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("dm-message")
            .setDescription("Change the message sent in the members DM")
            .addStringOption((opt) =>
              opt
                .setName("dm-message")
                .setDescription(
                  "The welcome message to send in the dm, you can use {tag}, {user} and {mention}"
                )
                .setRequired(true)
            )
        )
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("disable the welcome system")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const { options, member, guildId } = interaction;
    if (!member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({
        embeds: [
          new EmbedBuilder.setDescription(
            `${
              client.messageConfig.error
            } **${client.messageConfig.missingPermissionsText.replace(
              "{permission}",
              "Administrator"
            )}**`
          ).setColor(client.messageConfig.errorEmbedColor),
        ],
        ephemeral: true,
      });
    const subComamnd = options.getSubcommand(true);
    const subCommandGroup = options.getSubcommandGroup();
    if (subCommandGroup) {
      switch (subComamnd) {
        case "channel":
          const channelEditData = await welcomeSchema.findOne({
            GuildID: guildId,
          });
          if (!channelEditData)
            return await interaction.reply({
              ephemeral: true,
              content:
                "The welcome system is not setup in this server, you can use </welcome setup:1170627934038536202> to do so.",
            });
          const ChannelForData = options.getChannel("channel");
          channelEditData.Channel = ChannelForData.id;
          await channelEditData.save();
          await interaction.reply({
            ephemeral: true,
            content: `Successfully changed welcome channel to <#${ChannelForData.id}>`,
          });
          break;

        case "channel-message":
          const channelMsgEditData = await welcomeSchema.findOne({
            GuildID: guildId,
          });
          if (!channelMsgEditData)
            return await interaction.reply({
              ephemeral: true,
              content:
                "The welcome system is not setup in this server, you can use </welcome setup:1170627934038536202> to do so.",
            });
          const MsgForData = options.getString("channel-message");
          channelMsgEditData.ChannelMessage = MsgForData;
          await channelMsgEditData.save();
          await interaction.reply({
            ephemeral: true,
            content: `Successfully changed welcome channel message to: \`${MsgForData}\``,
          });
          break;

        case "dm-message":
          const dmMsgEditData = await welcomeSchema.findOne({
            GuildID: guildId,
          });
          if (!dmMsgEditData)
            return await interaction.reply({
              ephemeral: true,
              content:
                "The welcome system is not setup in this server, you can use </welcome setup:1170627934038536202> to do so.",
            });
          const DMMSGforData = options.getString("dm-message");
          dmMsgEditData.DmMessage = DMMSGforData;
          await dmMsgEditData.save();
          await interaction.reply({
            ephemeral: true,
            content: `Successfully changed welcome dm message to: \`${DMMSGforData}\``,
          });
          break;
        default:
          break;
      }
    } else {
      switch (subComamnd) {
        case "setup":
          const dataSetup = await welcomeSchema.findOne({ GuildID: guildId });
          if (dataSetup)
            return await interaction.reply({
              ephemeral: true,
              content:
                "Welcome system is already setup in this server you can use </welcome edit:1170627934038536202> to edit it instead.",
            });

          const channel = options.getChannel("channel");
          const channelMessage = options.getString("channel-message");
          const dmMessage = options.getString("dm-message");
          const newData = new welcomeSchema({
            GuildID: guildId,
            Channel: channel.id,
            DmMessage: dmMessage,
            ChannelMessage: channelMessage,
          });
          await newData.save();
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor(client.messageConfig.successEmbedColor)
                .setTitle(`Welcome System SetUp!`)
                .setDescription(
                  `Channel: <#${
                    channel.id
                  }>\nChannel Message:${channelMessage}\nDM Message: ${
                    dmMessage || "None"
                  }`
                ),
            ],
          });
          break;

        case "disable":
          const dataDisable = await welcomeSchema.findOne({ GuildID: guildId });
          if (!dataDisable)
            return await interaction.reply({
              ephemeral: true,
              content: "The welcome system is not setup in this server",
            });
          try {
            await welcomeSchema.findOneAndDelete({ GuildID: guildId });
            await interaction.reply({
              ephemeral: true,
              content: "Successfully disabled welcome system!",
            });
          } catch (error) {
            console.log(`Error in welcome setup: ${error}`);
          }

          break;
        default:
          break;
      }
    }
  },
};
