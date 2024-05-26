const Discord = require('discord.js');

module.exports = async (client, member) => {
    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Willkommen auf dem Server!')
        .setDescription(`Willkommen auf unserem Server, ${member}! Wir freuen uns, dich hier zu haben.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'willkommen');
    if (!welcomeChannel) return; // Überprüfen, ob der Willkommenskanal existiert

    welcomeChannel.send({ embeds: [welcomeEmbed] });
};