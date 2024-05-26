const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Zeigt Informationen über die Ping-Zeit, Discord.js-Version, Node.js-Version und Bot-Version.',
  testOnly: true,
  isOnline: true,
  permissionsRequired: [], // Hier können spezifische Berechtigungen angegeben werden, falls erforderlich
  enabled: false,
  


  callback: (client, interaction) => {
    const startTime = Date.now();
    const endTime = Date.now();
    const ping = endTime - startTime;
    const apiPing = interaction.client.ws.ping;
    const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Bot Information')
    .addFields(
      { name: ':ping_pong: Ping', value: `${ping}ms`, inline: true },
      { name: ':control_knobs: Discord.js API Ping', value: `${apiPing}ms`, inline: true },
      { name: ':green_book: Node.js Version', value: process.version, inline: true },
      { name: ':blue_book: Discord.js Version', value: require('discord.js').version, inline: true },
      { name: ':file_cabinet: Bot Version', value: '1.2.0', inline: true } // Hier die tatsächliche Bot-Version einfügen
    );


    interaction.reply({ embeds: [embed] });
  
  },
};