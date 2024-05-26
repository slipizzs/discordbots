const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: 'dbstatus',
    description: 'Displays the status of the database and allows for refreshing the embed.',
    permissions: [PermissionsBitField.Flags.Administrator],

    callback: async (client, interaction) => {
        const isDbOnline = mongoose.connection.readyState === 1;


        const embed = new EmbedBuilder()
            .setColor(isDbOnline ? 'Green' : 'Red')
            .setTitle('Database Status')
            .setDescription(`Status: ${isDbOnline ? 'Online' : 'Offline'}`);

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
            .setCustomId('refresh_db_status')
            .setLabel('Refresh ')
            .setEmoji({ name: "⏰" })
            .setStyle(ButtonStyle.Primary)
        );

        

        const message = await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'refresh_db_status' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            const refreshedEmbed = new EmbedBuilder(embed)
                .setDescription('Refreshing...');

            await i.update({ embeds: [refreshedEmbed] });

            // Check database status again
            const updatedIsDbOnline = mongoose.connection.readyState === 1;

            const updatedEmbed = new EmbedBuilder()
                .setColor(updatedIsDbOnline ? 'Green' : 'Red')
                .setTitle('Database Status')
                .setDescription(`Status: ${updatedIsDbOnline ? 'Online' : 'Offline'}`);


            await i.editReply({ embeds: [updatedEmbed] });
        });

        collector.on('end', () => {
        });
    },
};