const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuOptionBuilder } = require('discord.js');
const mongoose = require('mongoose');
const maintenance = require('../../server/maintenance');

// Verbindung zur MongoDB herstellen
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const versionSchema = new mongoose.Schema({
    version: { type: String, required: true },
    changelog: [{
        date: { type: Date, required: true },
        command: { type: String, required: true },
        action: { type: String, required: true },
        updates: { type: String, required: true }
    }]
});

const Version = mongoose.model('Version', versionSchema);

module.exports = {
    name: 'changelog',
    description: 'Fügt einen Eintrag zum Changelog hinzu und zeigt die aktuelle Version.',
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl zu verwenden.', ephemeral: true });
        }

        const commandSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('commandSelect')
            .setPlaceholder('Wähle einen Befehl')
            .setMinValues(1)
            .setMaxValues(10)
            .addOptions(
                { label: 'Giveaway', value: 'Giveaway' },
                { label: 'Umfrage', value: 'Umfrage' },
                { label: 'Changelog', value: 'Changelog' },
                { label: 'Ping', value: 'Ping' },
                { label: 'Clear', value: 'Clear' },
                { label: 'Ban', value: 'Ban' },
                { label: 'Kick', value: 'Kick' },
                { label: 'Timeout', value: 'Timeout' },
                { label: 'Verify', value: 'Verify' },
                { label: 'Ticket', value: 'Ticket' },
                { label: 'Statuscheck', value: 'Statuscheck' },
                { label: 'SetStatus', value: 'SetStatus' },
                { label: 'Play', value: 'Play' },
                { label: 'AutoPlay', value: 'AutoPlay' },
                { label: 'Cleanqueue', value: 'Cleanqueue' },
                { label: 'Leave', value: 'Leave' },
                { label: 'Stop', value: 'Stop' },
                { label: 'Setgame', value: 'Setgame' },
                { label: 'antiraidsystem', value: 'antiraidsystem' },
                { label: 'dbstatus', value: 'dbstatus' },
                { label: 'userdata', value: 'userdata' },
                { label: 'Bot', value: 'Bot' },
                { label: 'Alles', value: 'Alles' },
                { label: 'Bugs', value: 'Bugs' }
            );

        const actionSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('actionSelect')
            .setPlaceholder('Wähle eine Aktion')
            .setMinValues(1)
            .setMaxValues(3)
            .addOptions(
                { label: 'Änderung', value: 'change' },
                { label: 'Hinzufügung', value: 'addition' },
                { label: 'Entfernung', value: 'removal' }
            );

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmButton')
            .setLabel('Bestätigen')
            .setStyle(ButtonStyle.Primary);

        const row1 = new ActionRowBuilder().addComponents(commandSelectMenu);
        const row2 = new ActionRowBuilder().addComponents(actionSelectMenu);
        const row3 = new ActionRowBuilder().addComponents(confirmButton);

        const embed = new EmbedBuilder()
            .setTitle('Changelog Eintrag')
            .setDescription('Bitte wähle den Befehl und die Aktion aus den Menüs aus:')
            .setColor('#00FF00');

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2, row3],
            ephemeral: true
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        let selectedCommands = [];
        let selectedActions = [];

        collector.on('collect', async (i) => {
            if (i.customId === 'commandSelect') {
                selectedCommands = i.values;
                await i.update({ content: `Du hast die Befehle: ${selectedCommands.join(', ')} ausgewählt.`, components: [row2, row3], ephemeral: true });
            } else if (i.customId === 'actionSelect') {
                selectedActions = i.values;
                await i.update({ content: `Du hast die Aktionen: ${selectedActions.join(', ')} ausgewählt.`, components: [row1, row3], ephemeral: true });
            } else if (i.customId === 'confirmButton') {
                if (selectedCommands.length > 0 && selectedActions.length > 0) {
                    const modal = new ModalBuilder()
                        .setCustomId('updateModal')
                        .setTitle('Changelog Updates eingeben');

                    const versionInput = new TextInputBuilder()
                        .setCustomId('version')
                        .setLabel('Versionsnummer')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const updateInput = new TextInputBuilder()
                        .setCustomId('updates')
                        .setLabel('Beschreibe die Änderungen oder Hinzufügungen')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    const firstActionRow = new ActionRowBuilder().addComponents(versionInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(updateInput);

                    modal.addComponents(firstActionRow, secondActionRow);

                    await i.showModal(modal);
                } else {
                    await i.reply({ content: 'Bitte wähle zuerst einen Befehl und eine Aktion aus.', ephemeral: true });
                }
            }
        });

        client.on('interactionCreate', async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId === 'updateModal') {
                const version = modalInteraction.fields.getTextInputValue('version');
                const updates = modalInteraction.fields.getTextInputValue('updates');

                // Lade oder erstelle die aktuelle Version und den Changelog
                let versionData = await Version.findOne();
                if (!versionData) {
                    versionData = new Version({ version, changelog: [] });
                } else {
                    versionData.version = version;
                }

                selectedCommands.forEach(command => {
                    selectedActions.forEach(async action => {
                        // Bestimme die Art der Änderung
                        let actionText;
                        let embedColor;
                        switch (action) {
                            case 'change':
                                actionText = 'Änderung';
                                embedColor = '#0000FF'; // Blau für Änderungen
                                break;
                            case 'addition':
                                actionText = 'Hinzufügung';
                                embedColor = '#00FF00'; // Grün für Hinzufügungen
                                break;
                            case 'removal':
                                actionText = 'Entfernung';
                                embedColor = '#FF0000'; // Rot für Entfernungen
                                break;
                        }

                        // Füge den neuen Eintrag zum Changelog hinzu
                        const newEntry = {
                            date: new Date(),
                            command,
                            action: actionText,
                            updates
                        };
                        versionData.changelog.push(newEntry);

                        // Speichere die aktualisierte Version und den Changelog
                        await versionData.save();

                        // Erstelle das Embed für die Antwort
                        const changelogEmbed = new EmbedBuilder()
                            .setTitle('📜 Changelog 📜')
                            .setDescription(`**Version:** ${versionData.version}\n\n**Befehl:** ${command}\n\n**Aktion:** ${actionText}\n\n**Updates:**\n${updates}`)
                            .setColor(embedColor)
                            .setFooter({ text: `Datum: ${new Date().toLocaleDateString()}` });

                        // Sende das Embed in den Changelog-Channel
                        const changelogChannel = client.channels.cache.get('1243913212148056104');
                        if (changelogChannel) {
                            await changelogChannel.send({ embeds: [changelogEmbed] });
                        } else {
                            console.error('Changelog-Channel nicht gefunden.');
                        }

                        // Antwort auf die Modal-Interaktion
                        await modalInteraction.reply({ content: 'Changelog-Eintrag wurde hinzugefügt und gesendet.', ephemeral: true });
                    });
                });
            }
        });

        collector.on('end', (collected) => {
            if (selectedCommands.length === 0 || selectedActions.length === 0) {
                interaction.followUp({ content: 'Du hast nicht alle erforderlichen Angaben gemacht. Der Prozess wurde abgebrochen.', ephemeral: true });
            }
        });
    }
};