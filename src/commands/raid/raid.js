const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const messageLog = new Map();
const warningLog = new Map();
const THRESHOLD = 5; // Anzahl der Nachrichten
const INTERVAL = 10000; // Zeit in Millisekunden
const WARNINGS_THRESHOLD = 3;
const SECURITY_MODE_DURATION = 5 * 60 * 1000; // 5 Minuten

let originalPermissions = null;
let antiRaidActive = true;
let securityModeActivated = false;
let securityLevel = 1; // Standard-Sicherheitsstufe

// Funktion zum Ändern der Sicherheitsstufe
function changeSecurityLevel(level) {
    // Hier Code einfügen, um die Sicherheitsstufe zu ändern (z. B. Discord-API-Aufrufe)
    securityLevel = level;
}

// Funktion zum Starten des Raids
function startRaid() {
    // Ändern Sie die Sicherheitsstufe auf 4
    changeSecurityLevel(4);
}

// Funktion zum Beenden des Raids
function endRaid() {
    // Ändern Sie die Sicherheitsstufe auf 1
    changeSecurityLevel(1);
}

module.exports = {
    name: 'antiraid',
    description: 'Aktiviert oder deaktiviert das Anti-Raid-System.',
    permissions: [PermissionsBitField.Flags.Administrator],
    options: [
        {
            name: 'action',
            description: 'Aktivieren oder Deaktivieren',
            type: 3, // STRING type
            required: true,
            choices: [
                { name: 'Aktivieren', value: 'aktivieren' },
                { name: 'Deaktivieren', value: 'deaktivieren' },
            ],
        },
    ],

    callback: async (client, interaction) => {
        const action = interaction.options.getString('action');
        
        if (action === 'aktivieren') {
            if (antiRaidActive) {
                return interaction.reply('Das Anti-Raid-System ist bereits aktiviert.');
            } else {
                antiRaidActive = true;
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Anti-Raid-System Aktiviert')
                    .setDescription('Das Anti-Raid-System wurde aktiviert.');

                return interaction.reply({ embeds: [embed] });
            }
        } else if (action === 'deaktivieren') {
            if (!antiRaidActive) {
                return interaction.reply('Das Anti-Raid-System ist bereits deaktiviert.');
            } else {
                antiRaidActive = false;
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Anti-Raid-System Deaktiviert')
                    .setDescription('Das Anti-Raid-System wurde deaktiviert.');

                return interaction.reply({ embeds: [embed] });
            }
        } else {
            return interaction.reply('Ungültige Aktion. Bitte verwende "aktivieren" oder "deaktivieren".');
        }
    }
};

const startAntiRaidSystem = (client) => {
    client.on('messageCreate', async (message) => {
        if (!antiRaidActive || message.author.bot) return;

        const { guild, author, channel } = message;
        if (!guild) return; // Wenn die Nachricht nicht von einem Server stammt, ignorieren

        const logKey = `${guild.id}-${author.id}`;
        const currentTime = Date.now();

        if (!messageLog.has(logKey)) {
            messageLog.set(logKey, []);
        }

        const timestamps = messageLog.get(logKey);
        timestamps.push({ time: currentTime, messageId: message.id });

        // Entferne alte Nachrichten außerhalb des Intervalls
        while (timestamps.length && timestamps[0].time <= currentTime - INTERVAL) {
            timestamps.shift();
        }

        if (timestamps.length >= THRESHOLD) {
            if (!warningLog.has(logKey)) {
                warningLog.set(logKey, 0);
            }

            const warnings = warningLog.get(logKey) + 1;
            warningLog.set(logKey, warnings);

            if (warnings < WARNINGS_THRESHOLD) {
                message.channel.send(`Warnung ${warnings}/${WARNINGS_THRESHOLD} für ${author.tag} wegen verdächtigen Verhaltens.`);

                const warningFolder = path.join(__dirname, 'logs');
                if (!fs.existsSync(warningFolder)) {
                    fs.mkdirSync(warningFolder);
                }

                const warningPath = path.join(warningFolder, 'warningLogs.txt');
                const warningMessage = `${new Date().toISOString()} - Warnung ${warnings}/${WARNINGS_THRESHOLD} für ${author.tag} (${author.id}) wegen verdächtigen Verhaltens.\n`;
                fs.appendFileSync(warningPath, warningMessage);

                // Nachrichten löschen
                const messageIds = timestamps.map(ts => ts.messageId);
                await channel.bulkDelete(messageIds, true);

                return;
            }

            const member = guild.members.cache.get(author.id);
            if (member) {
                // Aktion: Benutzer sperren
                try {
                    // Nachrichten löschen
                    const messageIds = timestamps.map(ts => ts.messageId);
                    await channel.bulkDelete(messageIds, true);

                    await member.ban({ reason: 'Raid verdächtiges Verhalten' });
                    console.log(`Benutzer ${author.tag} wurde wegen Raid verdächtigen Verhaltens gesperrt.`);

                    // Log in eine Datei schreiben
                    const logFolder = path.join(__dirname, 'logs');
                    if (!fs.existsSync(logFolder)) {
                        fs.mkdirSync(logFolder);
                    }

                    const logPath = path.join(logFolder, 'raidLogs.txt');
                    const logMessage = `${new Date().toISOString()} - Benutzer ${author.tag} (${author.id}) wurde wegen Raid verdächtigen Verhaltens gesperrt.\n`;
                    fs.appendFileSync(logPath, logMessage);

                    message.channel.send(`Benutzer ${author.tag} wurde wegen Raid verdächtigen Verhaltens gesperrt.`);

                    // Sicherheitsmodus aktivieren
                    originalPermissions = guild.roles.everyone.permissions;
                    await guild.roles.everyone.setPermissions([]);

                   // Überprüfen, ob der Sicherheitsmodus aktiviert ist und die Nachricht noch nicht gesendet wurde
                if (antiRaidActive && !securityModeActivated) {
                // Nachricht senden
                const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('Sicherheitsmodus aktiviert')
                .setDescription('Der Sicherheitsmodus wurde aktiviert. Es werden keine direkten Nachrichten mehr erlaubt und Einladungen sind deaktiviert.');
    
                message.channel.send({ embeds: [embed] });
                         
                changeSecurityLevel(4);
                // Sicherheitsmodus als aktiviert markieren, damit die Nachricht nicht erneut gesendet wird
                securityModeActivated = true;

}

setTimeout(async () => {
    if (securityModeActivated) {
        // Sicherheitsmodus deaktivieren und Sicherheitsstufe auf 1 setzen
        await guild.roles.everyone.setPermissions(originalPermissions);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Sicherheitsmodus Deaktiviert')
            .setDescription('Sicherheitsmodus wurde deaktiviert. Die vorherigen Rollenberechtigungen wurden wiederhergestellt.');

                message.channel.send({ embeds: [embed] });

                // Sicherheitsmodus als deaktiviert markieren
                securityModeActivated = false;
        
                // Sicherheitsstufe auf 1 zurücksetzen
                changeSecurityLevel(1);
    }
             }, SECURITY_MODE_DURATION);
                } catch (error) {
                    console.error(`Fehler beim Sperren des Benutzers ${author.tag}:`, error);
                    if (error.code === 50013) {
                        message.channel.send(`Fehler: Fehlende Berechtigungen zum Sperren von ${author.tag}.`);
                    }
                }
            }
        }
    });
};

module.exports.startAntiRaidSystem = startAntiRaidSystem;