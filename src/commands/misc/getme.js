const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const got = (...args) => import('got').then(({ default: fetch }) => fetch(...args));

async function fetchMeme() {
    const response = await got('https://www.reddit.com/r/memes/random/.json');
    const [list] = JSON.parse(response.body);
    const [post] = list.data.children;

    const permalink = post.data.permalink;
    const memeUrl = `https://reddit.com${permalink}`;
    const memeImage = post.data.url;
    const memeTitle = post.data.title;
    const memeUpvotes = post.data.ups;
    const memeNumComments = post.data.num_comments;

    const embed = new EmbedBuilder()
        .setTitle(memeTitle)
        .setURL(memeUrl)
        .setColor('Random')
        .setImage(memeImage)
        .setFooter({ text: `👍 ${memeUpvotes} 💬 ${memeNumComments}` });

    return embed;
}

module.exports = {
    name: 'meme',
    description: 'Get a meme!',
    
    callback: async (client, interaction) => {
        const embed = await fetchMeme();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('next_meme')
                    .setLabel('Next Meme')
                    .setStyle(ButtonStyle.Primary),
            );

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = i => i.customId === 'next_meme' && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'next_meme') {
                const newEmbed = await fetchMeme();
                await i.update({ embeds: [newEmbed] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Button interaction timed out.', components: [] });
            }
        });
    }
};