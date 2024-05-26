const { joinVoiceChannel } = require('@discordjs/voice');
const {  PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');

module.exports = {
    name: 'join',
    description: 'Bringt den Bot dazu, dem Voice-Channel beizutreten, in dem du dich befindest.',
    callback: async(client, message) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('Du musst dich in einem Voice-Channel befinden, damit ich beitreten kann!');
        }

        const botPermissions = voiceChannel.permissionsFor(message.client.user);
        if (!botPermissions.has(PermissionsBitField.Flags.Connect) || !botPermissions.has(PermissionsBitField.Flags.Speak)) {
            return message.reply('Ich habe keine Berechtigung, deinem Voice-Channel beizutreten und zu sprechen!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        message.reply(`Ich bin dem Voice-Channel ${voiceChannel.name} beigetreten!`);
    },
};