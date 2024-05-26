const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'giveaway',
    description: 'Startet ein Giveaway.',
    options: [
        {
            name: 'preis',
            description: 'Der Preis des Giveaways.',
            type: 3, // String
            required: true
        },
        {
            name: 'dauer',
            description: 'Die Dauer des Giveaways.',
            type: 4, // Integer
            required: true
        },
        {
            name: 'einheit',
            description: 'Die Zeiteinheit der Dauer (Minuten, Stunden, Tage, Wochen).',
            type: 3, // String
            required: true,
            choices: [
                { name: 'Minuten', value: 'minutes' },
                { name: 'Stunden', value: 'hours' },
                { name: 'Tage', value: 'days' },
                { name: 'Wochen', value: 'weeks' }
            ]
        }
    ],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl zu verwenden.', ephemeral: true });
            return;
        }

        const prize = interaction.options.getString('preis');
        const duration = interaction.options.getInteger('dauer');
        const unit = interaction.options.getString('einheit');

        let durationMs;
        switch (unit) {
            case 'minutes':
                durationMs = duration * 60 * 1000; // Minuten in Millisekunden
                break;
            case 'hours':
                durationMs = duration * 60 * 60 * 1000; // Stunden in Millisekunden
                break;
            case 'days':
                durationMs = duration * 24 * 60 * 60 * 1000; // Tage in Millisekunden
                break;
            case 'weeks':
                durationMs = duration * 7 * 24 * 60 * 60 * 1000; // Wochen in Millisekunden
                break;
            default:
                interaction.reply({ content: 'Ungültige Zeiteinheit.', ephemeral: true });
                return;
        }

        const giveawayEmbed = new EmbedBuilder()
            .setTitle('🎉 Giveaway! 🎉')
            .setDescription(`Preis: **${prize}**\n um teilzunehmen drück auf denn Teilnehm Button! 🎉`)
            .setColor('#00FF00')
            .setFooter({ text: `Dauer: ${duration} ${unit}` });

        const button = new ButtonBuilder()
            .setCustomId('giveaway_enter')
            .setLabel('🎉Teilnehmen🎉')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        const message = await interaction.reply({ embeds: [giveawayEmbed], components: [row], fetchReply: true });

        const filter = i => i.customId === 'giveaway_enter' && !i.user.bot;
        const collector = message.createMessageComponentCollector({ filter, time: durationMs });
        collector.endTime = Date.now() + durationMs; // Setze endTime explizit

        const participants = new Set();

        const updateTimer = setInterval(() => {
            const remainingTime = collector.endTime - Date.now();
            const remainingSeconds = Math.floor(remainingTime / 1000);
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingDays = Math.floor(remainingHours / 24);
            const remainingWeeks = Math.floor(remainingDays / 7);

            const remainingString = `Verbleibende Zeit: ${remainingWeeks} Wochen, ${remainingDays % 7} Tage, ${remainingHours % 24} Stunden, ${remainingMinutes % 60} Minuten, ${remainingSeconds % 60} Sekunden`;
            giveawayEmbed.setFooter({ text: remainingString });

            interaction.editReply({ embeds: [giveawayEmbed], components: [row] });
        }, 1000);

        collector.on('collect', async i => {
            if (!participants.has(i.user.id)) {
                participants.add(i.user.id);
                await i.reply({ content: 'Du hast erfolgreich am Giveaway teilgenommen!', ephemeral: true });
            } else {
                await i.reply({ content: 'Du hast bereits teilgenommen!', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            clearInterval(updateTimer);

            if (participants.size === 0) {
                await interaction.editReply({ content: 'Es gab keine Teilnehmer für dieses Giveaway.', components: [] });
                return;
            }

            const winnerId = Array.from(participants)[Math.floor(Math.random() * participants.size)];
            const winner = await client.users.fetch(winnerId);

            const winnerEmbed = new EmbedBuilder()
                .setTitle('🎉 Giveaway Beendet! 🎉')
                .setDescription(`Preis: **${prize}**\n\nDer Gewinner ist: ${winner.tag}! 🎉`)
                .setColor('#00FF00')
                .setFooter({ text: `Dauer: ${duration} ${unit}` });

            await interaction.editReply({ embeds: [winnerEmbed], components: [] });

            await winner.send(`Herzlichen Glückwunsch! Du hast das Giveaway für **${prize}** gewonnen! 🎉`);
            await interaction.followUp({ content: `Herzlichen Glückwunsch an ${winner.toString()}!`, ephemeral: true });
        });
    }
};