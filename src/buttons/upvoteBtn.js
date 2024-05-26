const {ButtonBuilder, ButtonStyle, ActionRowBuilder, Component} = require("discord.js");
const suggestionSchema = require ("../schemas/suggestions");

module.exports = {
    customId: "upvoteBtn",
    userPermissions: [],
    botPermissions: [],

    run: async (client, interaction) => {
        const {guildId, message, user} = interaction;

        const dataGD = await suggestionSchema.findOne({GuildID: guildId});
        const suggestion = dataGD.SuggestionSystem.Suggestions.find((s) => s.MessageID === message.id);
        const voter = suggestion.Votes.find((v) => v.VoterID === user.id)

        if (voter) {
            if (voter.Vote === "upvote") {
                suggestion.Downvotes--;
                suggestion.Votes = suggestion.Votes.filter((v) => v.VoterID !== user.id);

            }else if (voter.Vote === "downvote") {
                suggestion.Upvotes--;
                suggestion.Downvotes++;
                voter.Vote = "upvote";

            };
        } else {
            suggestion.Downvotes++;
            suggestion.Votes.push({VoterID: user.id, Vote: "upvote"});

        };
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId("upvoteBtn")
            .setLabel(`Upvotes: ${suggestion.Upvotes}`)
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId("downvoteBtn")
            .setLabel(`Downvotes: ${suggestion.Downvotes}` )
            .setStyle(ButtonStyle.Secondary),
        );
        const totalVotes = suggestion.Upvotes + suggestion.Downvotes;
        let perventage = 0;
        if (totalVotes !== 0){
            percentage = (suggestion.Upvotes / totalVotes) * 100;
        }
        const percentageString = `${percentage.toFixed(2)}%`;
        message.embeds[0].fields[0].value = percentageString;

        await interaction.update({embeds: [message.embeds[0]], components: [buttons]});
        await dataGD.save().catch((err) => console.error(err));
    }
}