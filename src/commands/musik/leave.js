const { queue } = require('./play');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'leave',
    description: 'Verlässt den Voice-Channel.',
   callback: async(client, message) => {
    if (maintenance.isMaintenanceMode()) {
        return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
    }

        const serverQueue = queue.get(message.guild.id);
        if (!message.member.voice.channel || !serverQueue) return message.channel.send('Es gibt keine Warteschlange.');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.member.voice.channel.leave();
        message.channel.send('Ich verlasse den Voice-Channel.');
    }
};