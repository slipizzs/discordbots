const { queue } = require('./play');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'stop',
    description: 'Stoppt die Wiedergabe und löscht die Warteliste.',
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const serverQueue = queue.get(interaction.guild.id);

        if (!serverQueue) {
            return interaction.reply('Es gibt keinen Song, den ich stoppen kann!');
        }

        serverQueue.songs = [];
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queue.delete(interaction.guild.id);
        interaction.reply('Die Wiedergabe wurde gestoppt und die Warteliste wurde geleert.');
    },
};