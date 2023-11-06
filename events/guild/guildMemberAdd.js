const { Events, GuildMember, Client, EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../../schemas/welcomeSchema");

module.exports = {
  name: Events.GuildMemberAdd,
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const data = await welcomeSchema.findOne({ GuildID: member.guild.id });

    if (!data) return;

    const channelID = data.Channel;
    const channel = await member.guild.channels.cache.get(channelID);
    const { ChannelMessage, DmMessage } = data;

    const interpolate = (message) => {
      return message
        .replace(
          /{tag}/g,
          `${member.user.username}#${member.user.discriminator}`
        )
        .replace(/{mention}/g, `<@${member.user.id}>`)
        .replace(/{user}/g, member.user.username);
    };

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.messageConfig.embedColor)
          .setTitle("Welcome!")
          .setDescription(interpolate(ChannelMessage)),
      ],
    });

    if (DmMessage) {
      await member.send(interpolate(DmMessage)).catch(() => {});
    }
  },
};
