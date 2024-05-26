const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');

let ticketCount = 0;

module.exports = {
    name: 'createticket',
    description: 'Erstellt ein Ticket.',
    permissions: [PermissionsBitField.Flags.Administrator], // Befehl nur für Administratoren
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const Ticketcreateembed = new EmbedBuilder()
            .setTitle('Ticket erstellen')
            .setDescription('Klicke auf den Button, um ein Ticket zu erstellen:')
            .setColor('#0099ff');

        const button = new ButtonBuilder()
            .setLabel('Ticket erstellen')
            .setCustomId('create_ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({ embeds: [Ticketcreateembed], components: [row] });

        const filter = i => i.customId === 'create_ticket' && i.isButton();
        const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            try {
                ticketCount++;

                const user = i.user;

                const ticketEmbed = new EmbedBuilder()
                    .setTitle(`Neues Ticket (#${ticketCount})`)
                    .setDescription(`Was ist dein Problem?`)
                    .setColor('#0099ff');

                const option1Button = new ButtonBuilder()
                    .setLabel('Technisches Problem')
                    .setCustomId('technical_problem')
                    .setStyle(ButtonStyle.Primary);

                const option2Button = new ButtonBuilder()
                    .setLabel('Feedback')
                    .setCustomId('feedback')
                    .setStyle(ButtonStyle.Primary);

                const option3Button = new ButtonBuilder() // Neuer Button für ein weiteres Problem
                    .setLabel('Andere Frage')
                    .setCustomId('other_question')
                    .setStyle(ButtonStyle.Primary);

                const option4Button = new ButtonBuilder() // Neuer Button für ein weiteres Problem
                    .setLabel('Beschwerde')
                    .setCustomId('complaint')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder()
                    .addComponents(option1Button, option2Button, option3Button, option4Button); // Alle Optionen hinzufügen

                await user.send({ embeds: [ticketEmbed], components: [row] });
            } catch (error) {
                console.error('Error occurred while handling ticket creation:', error);
                await interaction.editReply({ content: 'Ein Fehler ist aufgetreten.', components: [] });
            }
        });

        client.on('interactionCreate', async interaction => {
            if (!interaction.isMessageComponent() || interaction.user.bot) return;

            try {
                const user = interaction.user;
                let problem;

                // Problem basierend auf der ausgewählten Option setzen
                switch (interaction.customId) {
                    case 'technical_problem':
                        problem = 'Technisches Problem';
                        break;
                    case 'feedback':
                        problem = 'Feedback';
                        break;
                    case 'other_question': // Neue Option
                        problem = 'Andere Frage';
                        break;
                    case 'complaint': // Neue Option
                        problem = 'Beschwerde';
                        break;
                    default:
                        problem = 'Warte Kurz Bis er das Problem Auswählt es kommt gleich nh 2 nachricht';
                        break;
                }

                // Nachricht im privaten Chat löschen
                await interaction.message.delete();

                // Bestätigungsnachricht senden
                await user.send('Dein Problem wurde erfolgreich eingereicht.');
            } catch (error) {
                console.error('Error occurred while handling ticket issue selection:', error);
            }
        });
    },
};