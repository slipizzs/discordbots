const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'rps',
    description: 'Fordere jemanden zu einem Schere-Stein-Papier-Spiel heraus.',
    options: [
        {
            name: 'user',
            description: 'Der Benutzer, den du herausfordern möchtest.',
            type: 6, // USER
            required: true,
        }
    ],
    callback: async (client, interaction) => {
        const challengedUser = interaction.options.getUser('user');
        let currentPlayer = interaction.user;

        if (challengedUser.id === interaction.user.id) {
            return interaction.reply({ content: 'Du kannst dich nicht selbst herausfordern!', ephemeral: true });
        }

        const challengeEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${currentPlayer.username} ist dran. Fordere ${challengedUser.username} zu einem Schere-Stein-Papier-Spiel heraus!`)
            .setDescription('Wähle deine Aktion:')
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rock')
                    .setLabel('Stein')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('paper')
                    .setLabel('Papier')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('scissors')
                    .setLabel('Schere')
                    .setStyle(ButtonStyle.Primary),
            );

        const message = await interaction.reply({ content: `${challengedUser}`, embeds: [challengeEmbed], components: [buttons], fetchReply: true });

        const filter = i => ['rock', 'paper', 'scissors'].includes(i.customId) && (i.user.id === interaction.user.id || i.user.id === challengedUser.id);
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        let user1Choice;
        let user2Choice;

        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {
                user1Choice = i.customId;
            } else if (i.user.id === challengedUser.id) {
                user2Choice = i.customId;
            }

            await i.deferUpdate();

            if (user1Choice && user2Choice) {
                collector.stop();
            }
        });

        collector.on('end', async collected => {
            if (!user1Choice || !user2Choice) {
                return interaction.editReply({ content: 'Spiel abgebrochen. Beide Spieler haben nicht innerhalb der Zeit gewählt.', components: [], embeds: [] });
            }

            const result = determineWinner(user1Choice, user2Choice);
            let resultMessage;

            if (result === 'draw') {
                resultMessage = 'Es ist ein Unentschieden!';
            } else if (result === 'user1') {
                resultMessage = `${interaction.user.username} gewinnt!`;
            } else {
                resultMessage = `${challengedUser.username} gewinnt!`;
            }

            const resultEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Schere-Stein-Papier')
                .setDescription(`${interaction.user.username} wählte ${user1Choice}\n${challengedUser.username} wählte ${user2Choice}\n\n${resultMessage}`)
                .setTimestamp();

            await interaction.editReply({ content: 'Spiel beendet!', embeds: [resultEmbed], components: [] });
        });
    },
};

function determineWinner(user1Choice, user2Choice) {
    if (user1Choice === user2Choice) {
        return 'draw';
    }

    if ((user1Choice === 'rock' && user2Choice === 'scissors') ||
        (user1Choice === 'scissors' && user2Choice === 'paper') ||
        (user1Choice === 'paper' && user2Choice === 'rock')) {
        return 'user1';
    }

    return 'user2';
}