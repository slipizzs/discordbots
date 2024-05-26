const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');



module.exports = {
    name: 'buttonverify',
    description: 'Startet den Verifizierungsprozess.',
    permissions: ['ADMINISTRATOR'],
    callback: async (client, interaction) => {
        // Erstelle das Embed und den Button
        const embed = new EmbedBuilder()
            .setTitle('Verifizierung')
            .setDescription('Klicke auf den Button unten, um dich zu verifizieren.');

        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verifizieren')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        // Sende die Nachricht mit dem Embed und dem Button
        const message = await interaction.channel.send({ embeds: [embed], components: [row] });

        // Reagiere auf Button-Interaktionen
        const filter = i => i.customId === 'verify_button';
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            // Führe die Verifizierungslogik aus
            // Hier könntest du z.B. Rollen zuweisen oder weitere Aktionen durchführen

            // Benutzerdaten speichern
            const user = new User({
                userId: i.user.id,
                userName: i.user.username,
            });
            await user.save();

            // Benutzer benachrichtigen
            await i.reply({ content: 'Du wurdest erfolgreich verifiziert!', ephemeral: true });
        });
    }
};