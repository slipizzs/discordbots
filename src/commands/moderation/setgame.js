const { PermissionsBitField } = require('discord.js');
const {  ActivityType } = require('discord.js');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'setgame',
    description: 'Aktualisiert den Spielstatus des Bots.',
    options: [
        {
            name: 'text',
            description: 'Schreibe hier den neuen Spielstatus für den Bot.',
            type: 3, // String
            required: true,
        }
    ],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        // Überprüfe, ob der Benutzer, der den Befehl ausgeführt hat, ein Administrator ist
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
        }

        // Überprüfe, ob ein Spielstatus angegeben wurde
        const newStatus = interaction.options.getString('text');
        if (!newStatus) {
            return interaction.reply({ content: 'Bitte gib den neuen Spielstatus für den Bot an.', ephemeral: true });
        }

        // Aktualisiere den Spielstatus des Bots auf "Hört zu"
        await client.user.setPresence({ activities: [{ name: newStatus, type: ActivityType.Listening }], status: 'online' });

        // Sende eine Bestätigungsnachricht
        await interaction.reply({content: `Bot hört jetzt zu: "${newStatus}"`, ephemeral: true});
    },
};
