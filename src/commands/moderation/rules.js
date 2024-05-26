const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const maintenance = require('../../server/maintenance');

// Verbindung zur MongoDB herstellen
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ruleSchema = new mongoose.Schema({
    username: { type: String, required: true },
    id: { type: String, required: true }
});

const RuleAcceptance = mongoose.model('RuleAcceptance', ruleSchema);

// Regelwerk
const rules = [
    "Regel 1: Respektiere andere Mitglieder.",
    "Regel 2: Keine Beleidigungen, Hassreden oder Mobbing.",
    "Regel 4: Halte die Diskussionen im richtigen Kanal.",
    "Regel 5: Keine Unötigen sachen posten.",
    "Regel 6: Beim spam wird mal 3 mal verwahnt und automatisch gebannt durchs AntiRaid system.",
    "Regel 7: Nett Und Höfflich sein.",
    // Weitere Regeln hier hinzufügen...
];

module.exports = {
    name: 'regelwerk',
    description: 'Zeigt das Regelwerk und ermöglicht es Benutzern, das Regelwerk zu akzeptieren.',
    permissions: [PermissionsBitField.Flags.Administrator],

    callback: async (client, message) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const ruleEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Regelwerk')
            .setDescription('Bitte lies das Regelwerk sorgfältig durch und akzeptiere es, um fortzufahren.')
            .addFields(
                rules.map((rule, index) => ({
                    name: `Regel ${index + 1}:`,
                    value: rule,
                }))
            );

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_rules')
            .setLabel('Regelwerk akzeptieren')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false); // Button standardmäßig aktiviert

        const row = new ActionRowBuilder().addComponents(acceptButton);

        try {
            const sentMessage = await message.channel.send({ embeds: [ruleEmbed], components: [row] });

            const collector = sentMessage.createMessageComponentCollector({});

            collector.on('collect', async (interaction) => {
                // Benutzer, der die Regeln akzeptiert hat, in der MongoDB speichern
                const acceptedUser = new RuleAcceptance({
                    username: interaction.user.username,
                    id: interaction.user.id
                });

                try {
                    await acceptedUser.save();

                    await interaction.update({ content: 'Regelwerk akzeptiert!', components: [] });
                    // Hier kannst du weitere Aktionen ausführen, z.B. die Rolle des Benutzers aktualisieren.
                } catch (error) {
                    console.error('Fehler beim Speichern des akzeptierten Benutzers:', error);
                    await interaction.reply({ content: 'Es gab einen Fehler beim Akzeptieren der Regeln. Bitte versuche es später erneut.', ephemeral: true });
                }
            });
        } catch (error) {
            console.error(`Fehler beim Senden des Regelwerks in ${message.channel.name}:`, error);
            message.reply('Es gab einen Fehler beim Senden des Regelwerks. Bitte versuche es später erneut.');
        }
    },
};