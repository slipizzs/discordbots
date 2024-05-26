const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');
// Umfrageschema definieren
const polls = new Map();
const votedUsers = new Map(); // Map zur Verfolgung der abgegebenen Stimmen

module.exports = {
    name: 'umfrage',
    description: 'Startet eine Umfrage mit benutzerdefinierten Optionen.',
    options: [
        {
            name: 'question',
            description: 'Die Frage für die Umfrage.',
            type: 3,
            required: true
        },
        {
            name: 'options',
            description: 'Die Optionen für die Umfrage, durch Komma getrennt.',
            type: 3,
            required: true
        },
        {
            name: 'duration',
            description: 'Die Dauer der Umfrage in Minuten.',
            type: 4, // Typ 4 für Ganzzahl (Integer)
            required: true
        }
    ],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        // Überprüfung der Administratorberechtigungen
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl zu verwenden.', ephemeral: true });
            return;
        }

        const questionOption = interaction.options.get('question').value;
        const optionsList = interaction.options.get('options').value.split(',');
        const duration = interaction.options.get('duration').value * 60000; // Umwandeln von Minuten in Millisekunden

        if (!questionOption || !optionsList || optionsList.length < 2 || optionsList.length > 5 || !duration) {
            interaction.reply({ content: 'Bitte gib eine Frage, zwischen 2 und 5 Optionen durch Komma getrennt, und die Dauer der Umfrage in Minuten an.', ephemeral: true });
            return;
        }

        // Umfrage-Objekt erstellen
        const poll = {
            question: questionOption,
            options: optionsList,
            votes: Array(optionsList.length).fill(0), // Initialisiert die Stimmen für jede Option auf 0
            endTime: Date.now() + duration // Endzeit der Umfrage berechnen
        };

        // Umfrage in die Map einfügen
        polls.set(interaction.id, poll);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Umfrage')
            .setDescription(questionOption)
            .addFields(
                { name: 'Verbleibende Zeit:', value: getRemainingTime(poll.endTime) },
                ...optionsList.map((option, index) => {
                    return { name: `Option ${String.fromCharCode(65 + index)}`, value: `${option.trim()} - 0 Stimmen` };
                })
            );

        const row = new ActionRowBuilder()
            .addComponents(
                optionsList.map((_, index) => {
                    const button = new ButtonBuilder()
                        .setCustomId(`option_${index}`)
                        .setLabel(String.fromCharCode(65 + index)) // A, B, C, etc.
                        .setStyle(ButtonStyle.Success);

                    return button;
                })
            );

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })
            .catch(error => {
                console.error(`Error replying to interaction: ${error}`);
            });

        const filter = i => i.isButton() && i.customId.startsWith('option_') && !votedUsers.has(i.user.id);
        const collector = message.createMessageComponentCollector({ filter, time: duration });

        // Timer für die Umfrage
        const timer = setInterval(() => {
            if (polls.has(interaction.id)) {
                const poll = polls.get(interaction.id);
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Umfrage')
                    .setDescription(questionOption)
                    .addFields(
                        { name: 'Verbleibende Zeit:', value: getRemainingTime(poll.endTime) },
                        ...poll.options.map((opt, idx) => {
                            return { name: `Option ${String.fromCharCode(65 + idx)}`, value: `${opt.trim()} - ${poll.votes[idx]} Stimmen` };
                        })
                    );

                interaction.editReply({ embeds: [updatedEmbed] });
            } else {
                clearInterval(timer);
            }
        }, 1000); // Aktualisiert das Embed alle 10 Sekunden

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.user.bot) return;

            const optionIndex = parseInt(buttonInteraction.customId.split('_')[1]);
            if (optionIndex >= 0 && optionIndex < optionsList.length) {
                const poll = polls.get(interaction.id);

                // Erhöht die Stimmenanzahl für die ausgewählte Option
                poll.votes[optionIndex] += 1;

                const updatedEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Umfrage')
                    .setDescription(questionOption)
                    .addFields(
                        { name: 'Verbleibende Zeit:', value: getRemainingTime(poll.endTime) },
                        ...poll.options.map((opt, idx) => {
                            return { name: `Option ${String.fromCharCode(65 + idx)}`, value: `${opt.trim()} - ${poll.votes[idx]} Stimmen` };
                        })
                    );

                await interaction.editReply({ embeds: [updatedEmbed] });
                await buttonInteraction.reply({ content: `Du hast für Option ${String.fromCharCode(65 + optionIndex)} abgestimmt.`, ephemeral: true });

                // Benutzer zur Liste der abgegebenen Stimmen hinzufügen
                votedUsers.set(buttonInteraction.user.id, true);
            }
        });

        collector.on('end', () => {
            clearInterval(timer); // Stoppt den Timer
            const poll = polls.get(interaction.id);

            // Bestimmen der Gewinneroption
            const maxVotes = Math.max(...poll.votes);
            const winnerIndexes = poll.votes
                .map((votes, index) => votes === maxVotes ? index : -1)
                .filter(index => index !== -1);

            const winners = winnerIndexes.map(index => poll.options[index]);

            interaction.channel.send({
                content: `Die Umfrage ist beendet. Gewinneroption(en): ${winners.join(', ')} mit ${maxVotes} Stimmen.`,
                components: []
            });

            polls.delete(interaction.id);
            votedUsers.clear(); // Liste der abgegebenen Stimmen löschen
        });
    }
};

// Funktion zur Berechnung der verbleibenden Zeit
function getRemainingTime(endTime) {
    const remainingTime = endTime - Date.now();
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    return `${minutes} Minuten ${seconds} Sekunden`;
}