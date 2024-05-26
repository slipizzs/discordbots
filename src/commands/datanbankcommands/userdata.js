const { CommandInteraction } = require('discord.js');
const mongoose = require('mongoose');

// MongoDB-Verbindung herstellen
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

// Mongoose-Modell für Benutzerdaten erstellen
const UserData = mongoose.model('UserData', {
    userId: String,
    username: String,
    roles: [String],
});

module.exports = {
    name: 'setuserdata',
    description: 'Set user data in the database for all users on the server',
   callback: async (client, interaction) => {
        // Überprüfen Sie, ob der Befehl von einem Mitglied des Servers ausgeführt wird
        if (!interaction.member) {
            return interaction.reply('This command can only be used by members of the server.');
        }

        // Sammeln Sie eine Liste aller Benutzer auf dem Server
        const guild = interaction.guild;
        const guildMembers = await guild.members.fetch();
        const guildUsers = guildMembers.map(member => member.user);

        // Schleife durch jeden Benutzer und speichern Sie die Daten
        guildUsers.forEach(async user => {
            const userId = user.id;
            const username = user.username;
            const roles = guildMembers.find(member => member.user.id === user.id).roles.cache.map(role => role.name);

            // Benutzerdaten in die Datenbank speichern
            const userDataEntry = new UserData({
                userId: userId,
                username: username,
                roles: roles,
            });
            userDataEntry.save()
                .then(() => {
                    console.log(`User data for user ${username} (${userId}) inserted successfully.`);
                })
                .catch((error) => {
                    console.error('Error inserting data:', error);
                });
        });

        // Antwort senden
        await interaction.reply('User data stored successfully for all users on the server.');
    }
};