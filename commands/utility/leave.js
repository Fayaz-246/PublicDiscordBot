const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const leaveSchema = require("../../schemas/leaveSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Setup the leave system")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Setup the leave system")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel for the leave messages to be sent")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("channel-message")
            .setDescription(
              "The leave message to send in the channel, you can use {tag}, {user} and {mention}"
            )
            .setRequired(true)
        )
    )
    .addSubcommandGroup((subGroup) =>
      subGroup
        .setName("edit")
        .setDescription("Edit the leave system")
        .addSubcommand((sub) =>
          sub
            .setName("channel")
            .setDescription("Change the leave channel")
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("The channel for the leave messages to be sent")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("channel-message")
            .setDescription("Change the message sent in the leave channel")
            .addStringOption((opt) =>
              opt
                .setName("channel-message")
                .setDescription(
                  "The leave message to send in the channel, you can use {tag}, {user} and {mention}"
                )
                .setRequired(true)
            )
        )
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("disable the leave system")
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
          const channelEditData = await leaveSchema.findOne({
            GuildID: guildId,
          });
          if (!channelEditData)
            return await interaction.reply({
              ephemeral: true,
              content:
                "The leave system is not setup in this server, you can use </leave setup:1170661179828482128> to do so.",
            });
          const ChannelForData = options.getChannel("channel");
          channelEditData.Channel = ChannelForData.id;
          await channelEditData.save();
          await interaction.reply({
            ephemeral: true,
            content: `Successfully changed leave channel to <#${ChannelForData.id}>`,
          });
          break;

        case "channel-message":
          const channelMsgEditData = await leaveSchema.findOne({
            GuildID: guildId,
          });
          if (!channelMsgEditData)
            return await interaction.reply({
              ephemeral: true,
              content:
                "The leave system is not setup in this server, you can use </leave setup:1170661179828482128> to do so.",
            });
          const MsgForData = options.getString("channel-message");
          channelMsgEditData.ChannelMessage = MsgForData;
          await channelMsgEditData.save();
          await interaction.reply({
            ephemeral: true,
            content: `Successfully changed leave message to: \`${MsgForData}\``,
          });
          break;
        default:
          break;
      }
    } else {
      switch (subComamnd) {
        case "setup":
          const dataSetup = await leaveSchema.findOne({ GuildID: guildId });
          if (dataSetup)
            return await interaction.reply({
              ephemeral: true,
              content:
                "Leave system is already setup in this server you can use </leave edit:1170627934038536202> to edit it instead.",
            });

          const channel = options.getChannel("channel");
          const channelMessage = options.getString("channel-message");
          const newData = new leaveSchema({
            GuildID: guildId,
            Channel: channel.id,
            ChannelMessage: channelMessage,
          });
          await newData.save();
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setColor(client.messageConfig.successEmbedColor)
                .setTitle("Leave System SetUp!")
                .setDescription(
                  `Channel: <#${channel.id}>\nChannel Message:${channelMessage}`
                ),
            ],
          });
          break;

        case "disable":
          const dataDisable = await leaveSchema.findOne({ GuildID: guildId });
          if (!dataDisable)
            return await interaction.reply({
              ephemeral: true,
              content: "The leave system is not setup in this server",
            });
          try {
            await leaveSchema.findOneAndDelete({ GuildID: guildId });
            await interaction.reply({
              ephemeral: true,
              content: "Successfully disabled leave system!",
            });
          } catch (error) {
            console.log(`Error in leave setup: ${error}`);
          }

          break;
        default:
          break;
      }
    }
  },
};
