const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const maintenance = require('../../server/maintenance');

const BOT_DEVELOPER = 'adolfderbeste';

module.exports = {
    name: 'state',
    description: 'Zeigt die Statistiken des Servers an.',
    options: [],
    callback: async (client, interaction) => {
        if (maintenance.isMaintenanceMode()) {
            return interaction.reply({ content: 'Der Bot befindet sich im Wartungsmodus. Dieser Befehl ist derzeit deaktiviert.', ephemeral: true });
        }

        // Überprüfen, ob der Benutzer, der den Befehl ausgeführt hat, die Berechtigung hat
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Du benötigst Administratorberechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
        }

        const guild = interaction.guild;

        // Anzahl der Mitglieder
        const memberCount = guild.memberCount;

        // Anzahl der Textkanäle
        const textChannelsCount = guild.channels.cache.filter(channel => channel.type === 0).size;

        // Anzahl der Sprachkanäle
        const voiceChannelsCount = guild.channels.cache.filter(channel => channel.type === 2).size;

        // Anzahl der Rollen
        const rolesCount = guild.roles.cache.size;

        // Erstellungsdatum des Servers
        const createdAt = guild.createdAt.toLocaleDateString();

        const owner = await guild.fetchOwner();

        // Erstellen des Embeds für die Antwort
        const stateEmbed = new EmbedBuilder()
            .setTitle(`📊 Server Statistiken für ${guild.name}`)
            .setColor('#00FF00')
            .addFields(
                { name: '👥 Mitglieder', value: memberCount.toString(), inline: true },
                { name: '💬 Textkanäle', value: textChannelsCount.toString(), inline: true },
                { name: '🔊 Sprachkanäle', value: voiceChannelsCount.toString(), inline: true },
                { name: '🔧 Rollen', value: rolesCount.toString(), inline: true },
                { name: '📅 Erstellungsdatum', value: createdAt, inline: true },
                { name: '👑 Besitzer', value: owner.user.tag, inline: true },
                { name: '💻 Bot-Entwickler', value: BOT_DEVELOPER, inline: true }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }));

        await interaction.reply({ embeds: [stateEmbed] });
    }
};