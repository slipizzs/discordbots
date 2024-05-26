const { queue } = require('./play');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'autoplay',
    description: 'Schaltet den Autoplay-Modus ein oder aus.',
    callback: async(client, message) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('Es gibt keine Warteschlange.');
        serverQueue.autoplay = !serverQueue.autoplay;
        message.channel.send(`Autoplay ist jetzt ${serverQueue.autoplay ? 'aktiviert' : 'deaktiviert'}.`);
    }
};