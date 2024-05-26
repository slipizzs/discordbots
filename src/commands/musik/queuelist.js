const { queue } = require('./play');
const { EmbedBuilder } = require('discord.js');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'queuelist',
    description: 'Zeigt die aktuelle Warteschlange an.',
    callback: async(client, message) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('Es gibt keine Warteschlange.');
        const queueEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Aktuelle Warteschlange')
            .setDescription(serverQueue.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n'));

        message.channel.send({ embeds: [queueEmbed] });
    }
};