const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { ApplicationCommandOptionType } = require('discord.js');
const sodium = require('libsodium-wrappers');
const maintenance = require('../../server/maintenance');

const queue = new Map(); // Server Queue

module.exports = {
    name: 'play',
    description: 'Spielt ein Lied von YouTube ab.',
    options: [
        {
            name: 'song',
            description: 'Der YouTube-Link oder Titel des Songs, den du abspielen möchtest',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const song = interaction.options.getString('song');
        await sodium.ready; // Warten, bis libsodium-wrappers geladen ist

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('Du musst in einem Voice-Channel sein, um einen Song abzuspielen!');
        }

        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply('Ich benötige die Berechtigungen, um deinem Voice-Channel beizutreten und darin zu sprechen!');
        }

        const serverQueue = queue.get(interaction.guild.id);

        let url = song;
        if (!ytdl.validateURL(url)) {
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
            };

            const video = await videoFinder(song);
            if (video) {
                url = video.url;
            } else {
                return interaction.reply('Es wurden keine Ergebnisse für die Suche gefunden.');
            }
        }

        const songInfo = await ytdl.getInfo(url);
        const songDetails = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: interaction.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                player: createAudioPlayer(),
            };

            queue.set(interaction.guild.id, queueContruct);
            queueContruct.songs.push(songDetails);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });

                queueContruct.connection = connection;
                playSong(interaction.guild, queueContruct.songs[0]);

                connection.subscribe(queueContruct.player);

                queueContruct.player.on(AudioPlayerStatus.Idle, () => {
                    queueContruct.songs.shift();
                    if (queueContruct.songs.length > 0) {
                        playSong(interaction.guild, queueContruct.songs[0]);
                    } else {
                        queueContruct.connection.destroy();
                        queue.delete(interaction.guild.id);
                    }
                });

                queueContruct.player.on('error', error => {
                    console.error(error);
                    queueContruct.connection.destroy();
                    queue.delete(interaction.guild.id);
                    interaction.reply('Es gab einen Fehler beim Abspielen des Songs.');
                });

                await interaction.reply(`Spiele Song ab: ${songDetails.title}`);
            } catch (err) {
                console.error(err);
                queue.delete(interaction.guild.id);
                return interaction.reply('Es gab einen Fehler beim Verbinden mit dem Voice-Channel.');
            }
        } else {
            serverQueue.songs.push(songDetails);
            return interaction.reply(`**${songDetails.title}** wurde zur Warteliste hinzugefügt!`);
        }
    },
};

function playSong(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    serverQueue.player.play(resource);
}

module.exports.queue = queue;
module.exports.playSong = playSong;