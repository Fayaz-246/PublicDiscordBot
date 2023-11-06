const { Events, GuildMember, Client, EmbedBuilder } = require("discord.js");
const leaveSchema = require("../../schemas/leaveSchema");

module.exports = {
  name: Events.GuildMemberRemove,
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const data = await leaveSchema.findOne({ GuildID: member.guild.id });

    if (!data) return;

    const channelID = data.Channel;
    const channel = await member.guild.channels.cache.get(channelID);
    const { ChannelMessage } = data;

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
          .setTitle("Bye!")
          .setDescription(interpolate(ChannelMessage)),
      ],
    });
  },
};
