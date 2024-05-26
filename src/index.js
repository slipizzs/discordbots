require('dotenv').config();
const fs = require("fs");
const { Client, Partials, IntentsBitField, REST, Routes,Collection } = require('discord.js');
const mongoose = require("mongoose")
const eventHandler = require('./handlers/eventHandler');
const { clientId, testServer } = require('../config.json');
const { startAntiRaidSystem } = require('./commands/raid/raid');
const welcomeMessage = require('./server/welcome');
const { handleLogs } = require('./handlers/handlerlogs');
const logs = require("discord-logs")

const rest = new REST().setToken(process.env.TOKEN);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessageReactions,

  ]
  });




logs(client, {
  debug: true
});


(async () => {
  try{
    mongoose.set(`strictQuery`, false)
    await mongoose.connect(process.env.MONGODB_URI, );
  console.log("Connected to DB");
  eventHandler(client);
  handleLogs(client);
  } catch (error){
    console.log(`Error: ${error}`);
  }
})();
client.on('guildMemberAdd', (member) => {
  welcomeMessage(client, member);
});



client.login(process.env.TOKEN);

startAntiRaidSystem(client);
module.exports = { client };