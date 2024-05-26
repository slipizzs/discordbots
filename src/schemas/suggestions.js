const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    GuildID: String,
    SuggestionSystem: {
        Channel: String,
        suggestions: [
            {
                MessageID: String,
                AuthorID: String,
                Upvotes: Number,
                Downvotes: Number,
            }
        ]
    }
});

module.exports = mongoose.model('Suggestions', suggestionSchema);