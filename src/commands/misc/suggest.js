const { ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const suggestionSchema = require("../../schemas/suggestions");

module.exports = {
    name: "suggest",
    description: "Make a suggestion for the server",
    userPermissions: [],
    botPermissions: [],
    callback: async (client, interaction) => {
        const { user, guildId, guild } = interaction;

        const suggestionText = new TextInputBuilder()
            .setCustomId("suggestionTxI")
            .setPlaceholder("Suggestion")
            .setLabel("What is your suggestion?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const suggestionTitle = new TextInputBuilder()
            .setCustomId("suggestionTitleTxI")
            .setPlaceholder("Title")
            .setLabel("What is the title for your suggestion?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(suggestionTitle);
        const row2 = new ActionRowBuilder().addComponents(suggestionText);

        const modal = new ModalBuilder()
            .setCustomId("suggestion-modal")
            .setTitle("Suggestion Modal")
            .addComponents(row1, row2);

        await interaction.showModal(modal);

        const modalInteraction = await interaction.awaitModalSubmit({
            time: 60 * 1000,
            filter: (i) => i.user.id === user.id,
        });

        if (modalInteraction) {
            const dataGD = await suggestionSchema.findOne({ GuildID: guildId });
            if (!dataGD) {
                return modalInteraction.reply({ content: "This server hasn't set up their suggestions system yet.", ephemeral: true });
            }

            // Ensure SuggestionSystem and suggestions are defined
            if (!dataGD.SuggestionSystem || !dataGD.SuggestionSystem.suggestions) {
                dataGD.SuggestionSystem = { Channel: "", suggestions: [] };
            }

            if (!guild.channels.cache.get(dataGD.SuggestionSystem.Channel)) {
                return modalInteraction.reply({ content: "This server hasn't set up their suggestions system yet.", ephemeral: true });
            }

            const title = modalInteraction.fields.getTextInputValue("suggestionTitleTxI");
            const suggestion = modalInteraction.fields.getTextInputValue("suggestionTxI");

            // Hier initialisieren wir suggestion
            const suggestionObj = {
                Upvotes: 0,
                Downvotes: 0,
                votedUsers: new Set(), // Set für die verfolgten Benutzer-IDs
            };

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("upvoteBtn")
                    .setLabel("Upvote")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("downvoteBtn")
                    .setLabel("Downvote")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: user.tag,
                    iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle(title)
                .setDescription(suggestion)
                .setColor("#FFFFFF")
                .addFields({ name: "Upvotes (%)", value: `${suggestionObj.Upvotes}`, inline: true }) // Hier verwenden wir suggestionObj
                .addFields({ name: "Downvotes (%)", value: `${suggestionObj.Downvotes}`, inline: true }) // Hier verwenden wir suggestionObj
                .setTimestamp();

            const channel = guild.channels.cache.get(dataGD.SuggestionSystem.Channel);
            const msg = await channel.send({ embeds: [embed], components: [buttonRow] });

            dataGD.SuggestionSystem.suggestions.push({
                MessageID: msg.id,
                AuthorID: user.id,
                ...suggestionObj, // Hier fügen wir die Eigenschaften von suggestionObj hinzu
            });

            await dataGD.save().catch((err) => console.log(err));

            const thread = await msg.startThread({
                name: `Suggestion from ${user.tag}`,
            });

            await thread.members.add(user.id);
            await modalInteraction.reply({ content: `Your suggestion has been added to <#${channel.id}>`, ephemeral: true });

            // Button-Listener
            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === user.id,
                time: 60000, // 60 Sekunden Timeout
            });

            collector.on("collect", async (buttonInteraction) => {
                // Überprüfen, ob der Benutzer bereits abgestimmt hat
                if (suggestionObj.votedUsers.has(user.id)) {
                    await buttonInteraction.reply({ content: "You have already voted!", ephemeral: true });
                    return;
                }

                // Benutzer zur Liste der abgestimmten Benutzer hinzufügen
                suggestionObj.votedUsers.add(user.id);

                if (buttonInteraction.customId === "upvoteBtn") {
                    // Upvote-Verhalten
                    suggestionObj.Upvotes++; // Erhöhe die Anzahl der Upvotes
                } else if (buttonInteraction.customId === "downvoteBtn") {
                    // Downvote-Verhalten
                    suggestionObj.Downvotes++; // Erhöhe die Anzahl der Downvotes
                }

                // Aktualisiere die Nachricht mit den neuen Upvotes und Downvotes
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(suggestion)
                    .setColor("#FFFFFF")
                    .addFields(
                        { name: "Upvotes (%)", value: `${suggestionObj.Upvotes}`, inline: true },
                        { name: "Downvotes (%)", value: `${suggestionObj.Downvotes}`, inline: true }
                    )
                    .setTimestamp();

                await buttonInteraction.update({ embeds: [updatedEmbed], components: [buttonRow] });
            });

            collector.on("end", () => {
                // Code für das Ende des Collectors (falls benötigt)
            });
        }
    }
};
