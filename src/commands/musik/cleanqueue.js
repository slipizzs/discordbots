const { queue } = require('./play');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'cleanqueue',
    description: 'Entfernt alle Lieder aus der Warteschlange.',
    callback: async(client, message) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('Es gibt keine Warteschlange.');
        serverQueue.songs = [];
        message.channel.send('Die Warteschlange wurde geleert.');
    }
};