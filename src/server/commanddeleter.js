require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { clientId, testServer} = require('./../../config.json');


const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Starte das Löschen von Guild-Commands.');

        // Löschen aller Guild-Commands
        await rest.put(Routes.applicationGuildCommands(clientId, testServer), { body: [] });
        console.log('Erfolgreich alle Guild-Commands gelöscht.');

        // Löschen aller globalen Commands
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Erfolgreich alle globalen Commands gelöscht.');
    } catch (error) {
        console.error('Fehler beim Löschen von Commands:', error);
    }
})();