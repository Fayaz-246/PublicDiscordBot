const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "giveawayReactionAdded",
  execute(giveaway, member, reaction) {
    // reaction.users.remove(member.user);
    return member
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("Giveaway Entered")
            .setDescription(
              `You've entered a  [Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})\nPrize: \`${giveaway.prize}\`\n Good luck!`
            ),
        ],
      })
      .catch(() => {});
  },
};
