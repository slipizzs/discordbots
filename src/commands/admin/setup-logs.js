const { PermissionsBitField, EmbedBuilder, ChannelType, ApplicationCommandOptionType } = require('discord.js');
const logSchema = require('../../models/logs');

module.exports = {
    name: 'setup-logs',
    description: 'Setup logs for your server',
    permissions: [PermissionsBitField.Flags.Administrator],
    options: [
        {
            name: 'channel',
            description: 'The channel where logs will be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true
        }
    ],
     callback: async (client, interaction) =>  {
        const { guildId, options } = interaction;

        const logChannel = options.getChannel('channel');
        const embed = new EmbedBuilder();

        try {
            let data = await logSchema.find({ Guild: guildId });
            if (!data) {
                await logSchema.create({
                    Guild: guildId,
                    Channel: logChannel.id
                });
                embed.setDescription('Data was successfully sent to the database')
                    .setColor('Green')
                    .setTimestamp();
            } else {
                await logSchema.updateOne({ Guild: guildId }, { Channel: logChannel.id });
                embed.setDescription('Old data was updated successfully in the database')
                    .setColor('Green')
                    .setTimestamp();
            }
        } catch (err) {
            embed.setDescription('An error occurred while sending data to the database')
                .setColor('Red')
                .setTimestamp();
        }

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};