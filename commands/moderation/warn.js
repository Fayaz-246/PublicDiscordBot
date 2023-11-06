const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const warnSchema = require("../../schemas/warnSchema");
const uuid = require("../../utils/uuid");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .addUserOption((op) =>
      op.setName("user").setDescription("The user to warn").setRequired(true)
    )
    .addStringOption((op) =>
      op.setName("reason").setDescription("The reason for the warn")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const mConfig = client.messageConfig;
    const embed = new EmbedBuilder();

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
    const { options, guildId, user, guild } = interaction;

    const target = options.getUser("user");
    const reason = options.getString("reason") ?? "No reason provided";
    const userTag = `${target.username}#${target.discriminator}`;
    const uuID = uuid();

    const data = await warnSchema.findOne({
      GuildID: guildId,
      UserID: target.id,
      UserTag: userTag,
    });
    if (!data) {
      const newData = new warnSchema({
        GuildID: guildId,
        UserID: target.id,
        UserTag: userTag,
        Content: [
          {
            ExecuterId: user.id,
            ExecuterTag: user.tag,
            Reason: reason,
            ID: uuID,
          },
        ],
      });
      newData.save();
    } else {
      const warnContent = {
        ExecuterId: user.id,
        ExecuterTag: user.tag,
        Reason: reason,
        ID: uuID,
      };
      data.Content.push(warnContent);
      data.save();
    }

    const toSend = new EmbedBuilder()
      .setColor(mConfig.errorEmbedColor)
      .setDescription(`You were warned in ${guild.name}, for ${reason}`);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
        .setCustomId("jsajhfajbjfh")
        .setLabel(`Message from: ${guild.name}`)
    );

    embed
      .setColor(mConfig.successEmbedColor)
      .setDescription(
        `${mConfig.success} ***${target.username} has been warned.\nReason: \`${reason}\`***`
      );

    target.send({ embeds: [toSend], components: [row] }).catch((e) => {
      return console.log("Member DMS OFF", e);
    });
    interaction.reply({ embeds: [embed] });
  },
};
