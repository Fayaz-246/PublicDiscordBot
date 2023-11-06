const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} = require("discord.js");
const warnSchema = require("../../schemas/warnSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Get warnings from a user")
    .addUserOption((op) =>
      op.setName("user").setDescription("The user to check the warnings of")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const { options, guildId, user, guild } = interaction;

    const target = options.getUser("user") ?? user;
    const mConfig = client.messageConfig;
    const embed = new EmbedBuilder().setColor(mConfig.embedColor);
    const noWarns = new EmbedBuilder().setColor(mConfig.successEmbedColor);

    const data = await warnSchema.findOne({
      GuildID: guildId,
      UserID: target.id,
    });

    if (data && data.Content.length != 0) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("remove")
          .setLabel("Delete warnings")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🗑️")
      );
      embed.setDescription(
        `**${target.tag}'s warnings:** \n${data.Content.map(
          (w, i) =>
            `**Warning:** ${i + 1}\n**Warned By:** ${
              w.ExecuterTag
            }\n**Reason:** ${w.Reason}\n**ID:** ${w.ID}`
        ).join("\n---------------\n")}`
      );
      const msg = await interaction.reply({
        embeds: [embed],
        components: [row],
      });
      const cllctr = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      cllctr.on("collect", async (bi) => {
        if (!bi.member.permissions.has(PermissionFlagsBits.ManageMessages))
          return bi.reply({
            ephemeral: true,
            content: "You do not have permission to delete warnings",
          });

        const cms = bi.reply({
          content: "Enter the warn ID, say `cancel` to stop.",
          ephemeral: true,
        });
        const cltrID = bi.channel.createMessageCollector();
        cltrID.on("collect", async (msg) => {
          if (msg.author.bot) return;
          if (msg.author.id != bi.user.id) return;
          if (msg.content.toLowerCase() === "cancel") {
            msg.delete().catch(() => {});
            cltrID.stop();
            bi.followUp({
              content: "Cancelled the prompt",
              ephemeral: true,
            });
            return;
          }
          let find = data.Content.find((daata) => daata.ID == msg.content);
          if (!find)
            return bi.followUp({
              content: "Invalid ID",
              ephemeral: true,
            });

          let filter = data.Content.filter((dataa) => dataa !== find);

          data.Content = filter;
          await data.save();
          bi.followUp({
            content: `Sucessfully deleted warn ID ${msg.content}`,
            ephemeral: true,
          });
          cltrID.stop();
          msg.delete().catch(() => {});
        });
      });
    } else {
      noWarns.setDescription(
        `${mConfig.success} ${target.tag} has no warnings!`
      );
      interaction.reply({ embeds: [noWarns] });
    }
  },
};
