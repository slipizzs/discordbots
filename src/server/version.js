const mongoose = require('mongoose');

const changelogEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    command: String,
    action: String,
    updates: String
});

const versionSchema = new mongoose.Schema({
    version: { type: String, default: '1.0.0' },
    changelog: [changelogEntrySchema]
});

module.exports = mongoose.model('Version', versionSchema);