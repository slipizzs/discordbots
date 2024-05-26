const { queue, playSong } = require('./play');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'skip',
    description: 'Überspringt den aktuellen Song.',
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const serverQueue = queue.get(interaction.guild.id);

        if (!serverQueue) {
            return interaction.reply('Es gibt keinen Song, den ich überspringen kann!');
        }

        serverQueue.player.stop();
        interaction.reply('Der aktuelle Song wurde übersprungen.');
    },
};