const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');


module.exports = {
    name: 'help',
    description: 'Zeigt eine Liste aller verfügbaren Befehle und deren Beschreibungen.',
    options: [],
    callback: async (client, interaction) => {
        

        // Liste der Befehle und deren Beschreibungen
        const commands = [
            { name: 'changelog', description: 'Fügt einen Eintrag zum Changelog hinzu und zeigt die aktuelle Version.' },
            { name: 'setgame', description: 'Aktualisiert den Spielstatus des Bots.' },
            { name: 'state', description: 'Zeigt die Statistiken des Servers an.' },
            { name: 'help', description: 'Zeigt eine Liste aller verfügbaren Befehle und deren Beschreibungen.' },
            { name: 'ban', description: 'ban von leuten  (Admins)' },
            { name: 'Giveway', description: 'Gewinnspiele erstellen (Admins)' },
            { name: 'kick', description: 'Kickt leute vom server (Admins)' },
            { name: 'Rules', description: 'Regeln erstellen (Admins)' },
            { name: 'SetStatus', description: 'Um denn bot Status zu ändern (Admins)' },
            { name: 'timeout', description: 'Verwarnung zu geben (Admins)' },
            { name: 'Umfrage', description: 'Um eine Umfrage zu erstellen (Admins)' },
            { name: 'Verify', description: 'Um ein verify Button zu erstellen (Admins)' },
            { name: 'Ping', description: 'Um denn ping und andere sachen von bot zu sehen ' },
            { name: 'getme', description: 'um ein meme zu bekommen (Beta)' },
            { name: 'Statuscheck', description: 'um die command statuse zu checken ' },
            { name: 'Antiraid', description: 'Um das raid system zu aktivieren oder um es zu Deaktivieren (Admins)' },
            { name: 'Support', description: 'Um ein ticket button zu erstellen (Admins)' },
            { name: 'Play', description: 'Um musik zu spielen ' },
            { name: 'Stop', description: 'um die musik zu stoppen' },
            { name: 'Join', description: 'Um denn bot in denn channel zu holen ' },
            { name: 'cleanqueue', description: 'um die warteschlange zu entfernen ' },
            { name: 'leave', description: 'das der bot denn channel leavt' },
            { name: 'skip', description: 'um denn song zu skippen' },
            { name: 'queueliste', description: 'um die warteschlange zu sehen' },
            { name: 'suggestion', description: 'Um eine Idee zu erstellen' },
            { name: 'mainintence', description: 'um denn wartungs modus zu aktivieren/deaktivieren' },
            { name: 'rsp', description: 'um schere stein papier zu spielen' },
            // Füge hier weitere Befehle und deren Beschreibungen hinzu
        ];

        // Funktion zum Erstellen von Embeds für jede Seite
        const createHelpEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle('📖 Hilfe - Verfügbare Befehle')
                .setColor('#00FF00')
                .setDescription('Hier ist eine Liste aller verfügbaren Befehle und deren Beschreibungen:')
                .setThumbnail(client.user.avatarURL({ dynamic: true }))
                .setFooter({ text: `Seite ${page + 1} von ${Math.ceil(commands.length / 10)}` });

            const start = page * 10;
            const end = start + 10;
            const commandSlice = commands.slice(start, end);

            commandSlice.forEach(command => {
                embed.addFields({ name: `/${command.name}`, value: command.description, inline: false });
            });

            return embed;
        };

        let currentPage = 0;
        const totalPages = Math.ceil(commands.length / 5);

        // Erstelle die Buttons
        const getButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Vorherige')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Nächste')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1)
            );
        };

        // Erste Seite anzeigen
        const message = await interaction.reply({ embeds: [createHelpEmbed(currentPage)], components: [getButtons()], fetchReply: true , ephemeral: true});

        // Erstelle einen Collector für die Buttons
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'Du kannst diesen Button nicht benutzen.', ephemeral: true });
            }

            if (i.customId === 'previous') {
                currentPage--;
            } else if (i.customId === 'next') {
                currentPage++;
            }

            await i.update({ embeds: [createHelpEmbed(currentPage)], components: [getButtons()] });
        });

        collector.on('end', () => {
            message.edit({ components: [] });
        });
    },
};