const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const maintenance = require('../../server/maintenance');
let endTime = null;
let interval;

module.exports = {
    name: 'maintenance',
    description: 'Aktiviert oder deaktiviert den Wartungsmodus.',
    options: [
        {
            name: 'status',
            description: 'Aktiviert (on) oder deaktiviert (off) den Wartungsmodus.',
            type: 3, // String
            required: true,
            choices: [
                { name: 'On', value: 'on' },
                { name: 'Off', value: 'off' }
            ]
        },
        {
            name: 'time',
            description: 'Die Dauer des Wartungsmodus in Minuten.',
            type: 4, // Integer,
            required: false
        }
    ],
    
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
        }

        const status = interaction.options.getString('status');

        if (status === 'on') {
            const time = interaction.options.getInteger('time') || 0;

            if (time > 0) {
                endTime = new Date(Date.now() + time * 60000); // Endzeit berechnen
            } else {
                endTime = null;
            }

            maintenance.setMaintenanceMode(true);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Wartungsmodus aktiviert')
                .setDescription(`Alle Befehle sind nun deaktiviert. ${endTime ? `Der Wartungsmodus wird in ${formatTime((endTime - Date.now()) / 1000)} automatisch deaktiviert.` : ''}`);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('disable_maintenance')
                        .setLabel('Deaktivieren')
                        .setStyle(ButtonStyle.Danger)
                );

            const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const updateInterval = () => {
                if (endTime) {
                    const remainingTime = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

                    if (remainingTime === 0) {
                        clearInterval(interval);
                        maintenance.setMaintenanceMode(false);
                        endTime = null;

                        const embedOff = new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('Wartungsmodus deaktiviert')
                            .setDescription('Alle Befehle sind nun wieder aktiviert.');

                        interaction.editReply({ embeds: [embedOff], components: [] });
                    } else {
                        const timeString = formatTime(remainingTime);
                        embed.setDescription(`Alle Befehle sind nun deaktiviert. Der Wartungsmodus wird in ${timeString} automatisch deaktiviert.`);
                        reply.edit({ embeds: [embed] });
                    }
                }
            };

            interval = setInterval(updateInterval, 1000);

            // Button Interaktion
            const collector = reply.createMessageComponentCollector({
                filter: i => i.customId === 'disable_maintenance' && i.member.permissions.has(PermissionsBitField.Flags.Administrator),
                time: time * 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'disable_maintenance') {
                    clearInterval(interval);
                    maintenance.setMaintenanceMode(false);
                    endTime = null;

                    const embedOff = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Wartungsmodus deaktiviert')
                        .setDescription('Alle Befehle sind nun wieder aktiviert.');

                    await i.update({ embeds: [embedOff], components: [] });
                }
            });
        } else {
            maintenance.setMaintenanceMode(false);
            clearInterval(interval);
            endTime = null;

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Wartungsmodus deaktiviert')
                .setDescription('Alle Befehle sind nun wieder aktiviert.');

            await interaction.reply({ embeds: [embed], components: [] });
        }
    }
};

function formatTime(timeInSeconds) {
    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${days} Tage, ${hours} Stunden, ${minutes} Minuten und ${seconds} Sekunden`;
}