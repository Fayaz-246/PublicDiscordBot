const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const afkSchema = require("../../schemas/afkSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription(
      "Set an AFK status shown when you're mentioned, and display in nickname"
    )
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription(
          "Set an AFK status shown when you're mentioned, and display in nickname"
        )
        .addStringOption((option) =>
          option.setName("message").setDescription("Message to set")
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const subCommand = options.getSubcommand(["set"]);
    const reason = options.getString("message") ?? "AFK";
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (!subCommand) return;
    const data = await afkSchema.findOne({ UserID: userId, GuildID: guildId });
    if (!data) {
      const newData = new afkSchema({
        AFK: true,
        UserID: userId,
        GuildID: guildId,
        Reason: reason,
        Time: Date.now(),
      });
      newData.save();
      const nick = `[AFK] ${
        interaction.member.nick || interaction.user.globalName
      }`;
      await interaction.member.setNickname(nick).catch((e) => {});
      await interaction.reply({
        content: `<@${interaction.user.id}> I set your AFK: ${reason}`,
      });
    } else {
      if (data.AFK === true)
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.messageConfig.errorEmbedColor)
              .setDescription(
                `${client.messageConfig.error} You are already AFK.`
              ),
          ],
          ephemeral: true,
        });
      data.AFK = true;
      data.Reason = reason;
      data.Time = Date.now();

      await data.save();
      const nick = `[AFK] ${
        interaction.member.nick || interaction.user.globalName
      }`;
      await interaction.member.setNickname(nick).catch((e) => {});
      await interaction.reply({
        content: `<@${interaction.user.id}> I set your AFK: ${reason}`,
      });
    }
  },
};
