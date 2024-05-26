const { PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'setstatus',
    description: 'Setzt den Status des Bots.',
    permissions: [PermissionsBitField.Flags.Administrator],
    options: [
        {
            name: 'status',
            description: 'Der neue Status des Bots.',
            type: 3,
            required: true,
            choices: [
                { name: 'Online', value: 'online' },
                { name: 'Abwesend', value: 'idle' },
                { name: 'Nicht stören', value: 'dnd' },
                { name: 'Offline', value: 'invisible' }
            ]
        }
    ],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const status = interaction.options.getString('status');
        
        try {
            await client.user.setStatus(status);
            await interaction.reply({ content: `Status erfolgreich auf ${status} gesetzt.`, ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Setzen des Status:', error);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
        }
    }
};