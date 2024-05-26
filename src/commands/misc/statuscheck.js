const { EmbedBuilder } = require('discord.js');

const onlineEmoji = ':green_circle:'; // Definiere das Emoji für den Online-Status
const offlineEmoji = ':red_circle:';
const mainintenceEmoji = ':blue_circle:';

const commandsList = [
    { name: '**AntiRaidSystem**', description: onlineEmoji + '  **Online**' },
    { name: '**Ping**', description: onlineEmoji + '  **Online**' },
    { name: '**Clear**', description: onlineEmoji + '  **Online**' },
    { name: '**Ban**', description: onlineEmoji + '  **Online**' },
    { name: '**Kick**', description: onlineEmoji + '  **Online**' },
    { name: '**Timeout**', description: onlineEmoji + '  **Online**' },
    { name: '**Umfrage**', description: onlineEmoji + '  **Online**' },
    { name: '**Verify**', description: onlineEmoji + '  **Online**' },
    { name: '**Ticket**', description: onlineEmoji + '  **Online**' },
    { name: '**Statuscheck**', description: onlineEmoji + '  **Online**' },
    { name: '**Changelog**', description: onlineEmoji + '  **Online**' },
    { name: '**Giveway**', description: onlineEmoji + '  **Online**' },
    { name: '**Play**', description: onlineEmoji + '  **Online**' },
    { name: '**Cleanqueue**', description: onlineEmoji + '  **Online**' },
    { name: '**join**', description: onlineEmoji + '  **Online**' },
    { name: '**leave**', description: onlineEmoji + '  **Online**' },
    { name: '**autoplay**', description: onlineEmoji + '  **Online**' },
    { name: '**queulist**', description: onlineEmoji + '  **Online**' },
    { name: '**skip**', description: onlineEmoji + '  **Online**' },
    { name: '**stop**', description: onlineEmoji + '  **Online**' },
    { name: '**setgame**', description: onlineEmoji + '  **Online**' },
    

    // Füge hier die anderen Befehle hinzu
];

module.exports = {
    name: 'status',
    description: 'Zeigt den Status des Bots an.',
    callback: async(client, interaction) => {
        const uptimeInSeconds = Math.floor(process.uptime());
        const uptimeInMinutes = Math.floor(uptimeInSeconds / 60);
        const uptimeInHours = Math.floor(uptimeInMinutes / 60);
        const uptimeInDays = Math.floor(uptimeInHours / 24); // Uptime in Minuten

        // Erstelle das Embed für die Befehlsliste und die .env-Datei
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Status')
            .addFields(
                { name: 'Befehle', value: commandsList.map(command => `${command.name}: ${command.description}`).join('\n') },
                { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: 'Uptime', value: `${uptimeInDays} days, ${uptimeInHours % 24} hours, ${uptimeInMinutes % 60} minutes, ${uptimeInSeconds % 60} seconds.`, inline: true },
            );

        interaction.reply({ embeds: [embed] });
    },
};