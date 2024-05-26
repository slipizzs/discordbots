const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'examplecommand',
    description: 'Ein Beispielbefehl.',
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        // Rest des Befehls
        await interaction.reply('Dieser Befehl funktioniert wie erwartet.');
    }
};