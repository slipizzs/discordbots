const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const maintenance = require('../../server/maintenance');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (maintenance.isMaintenanceMode()) {
      return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
  }

    const mentionable = interaction.options.get('target-user').value;
    const duration = interaction.options.get('duration').value; // 1d, 1 day, 1s 5s, 5m
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription("That user doesn't exist in this server.");
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUser.user.bot) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription("I can't timeout a bot.");
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('Please provide a valid timeout duration.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      const errorEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('Timeout duration cannot be less than 5 seconds or more than 28 days.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription("You can't timeout that user because they have the same/higher role than you.");
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription("I can't timeout that user because they have the same/higher role than me.");
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Timeout the user
    try {
      const { default: prettyMs } = await import('pretty-ms');

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        const successEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Timeout Updated')
          .setDescription(`${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`);
        await interaction.editReply({ embeds: [successEmbed] });
        return;
      }

      await targetUser.timeout(msDuration, reason);
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Timeout Success')
        .setDescription(`${targetUser} was timed out for ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(`There was an error when timing out: ${error}`);
    }
  },

  name: 'timeout',
  description: 'Timeout a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to timeout.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'Timeout duration (30m, 1h, 1 day).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};