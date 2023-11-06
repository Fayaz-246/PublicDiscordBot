const { Events, Client, Message, EmbedBuilder } = require("discord.js");
const afkSchema = require("../../schemas/afkSchema");
const ms = require("ms");

module.exports = {
  name: Events.MessageCreate,
  /**
   *
   * @param {Client} client
   * @param {Message} message
   */
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    /* USER AFK CHECKS */
    const checkData = await afkSchema.findOne({
      UserID: message.author.id,
      GuildID: message.guild.id,
    });
    if (checkData) {
      if (checkData.AFK) {
        checkData.AFK = false;
        await checkData.save();
        message.member.setNickname(message.author.globalName).catch((e) => {});
        const repl = await message.reply(
          `Welcome back <@${message.author.id}>, I removed your AFK.`
        );
        setTimeout(async () => repl.delete(), 5_000);
        return;
      }
    }

    /* MESSAGE MENTIONED AFK CHECK */

    const tagggedMembers = message.mentions.users.map((m) => m.id);
    if (tagggedMembers.length < 0) return;
    tagggedMembers.forEach(async (m) => {
      const taggedData = await afkSchema.findOne({
        UserID: m,
        GuildID: message.guild.id,
      });
      if (taggedData.AFK) {
        const member = message.guild.members.fetch(m);
        message.reply(
          `\`${(await member).user.username}\` is AFK: ${
            data.Reason || "AFK"
          } - ${ms(Date.now() - data.Time, { long: true })} ago`
        );
      }
    });
  },
};
