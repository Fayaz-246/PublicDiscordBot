const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  StringSelectMenuInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all of the commands of the bot"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const mConfig = client.messageConfig;
    const emojis = {
      community: "🏠",
      giveaways: "🎉",
      moderation: "🚫",
      utility: "⚙️",
    };

    const dirs = [...new Set(client.commands.map((cmd) => cmd.folder))];

    const formatStr = (str) =>
      `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

    const categories = dirs.map((dir) => {
      const getCommands = client.commands
        .filter((cmd) => cmd.folder === dir)
        .map((cmd) => {
          return {
            name: cmd.data.name,
            description:
              cmd.data.description || "No description on this command",
          };
        });

      return {
        directory: formatStr(dir),
        commands: getCommands,
      };
    });

    const embed = new EmbedBuilder()
      .setColor(mConfig.embedColor)
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: `${client.user.displayAvatarURL()}`,
      })
      .setDescription(
        "**See a list of commands by selecting a category down below!**"
      );

    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Select a category")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                description: `Commands from ${cmd.directory} category`,
                emoji: emojis[cmd.directory.toLowerCase() || null],
              };
            })
          )
      ),
    ];

    const initMsg = await interaction.reply({
      embeds: [embed],
      components: components(false),
    });

    const clltr = initMsg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (interaction) => interaction.user.id === interaction.member.id,
    });

    clltr.on("collect", async (interaction) => {
      const [directory] = interaction.values;
      const category = categories.find(
        (x) => x.directory.toLowerCase() === directory
      );

      const catEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColor)
        .setTitle(
          `${emojis[directory.toLowerCase()] || null} ${formatStr(
            directory
          )} commands`
        )
        .setDescription(`A list of all commands categorised under ${directory}`)
        .addFields(
          category.commands.map((cmd) => {
            return {
              name: `${cmd.name}`,
              value: `\`${cmd.description}\``,
            };
          })
        );

      interaction.update({ embeds: [catEmbed] });
    });

    clltr.on("end", () => {
      initMsg.edit({ components: components(true) });
    });
  },
};
