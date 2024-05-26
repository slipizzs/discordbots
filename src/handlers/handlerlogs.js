const { EmbedBuilder } = require("discord.js");
const logSchema = require("../models/logs");

// Set to keep track of logged message IDs
const loggedMessages = new Set();

async function send_log(client, guildId, embed, uniqueId) {
    if (loggedMessages.has(uniqueId)) return; // Skip if the log is already sent

    try {
        const data = await logSchema.findOne({ Guild: guildId });
        if (!data || !data.Channel) return;
        const LogChannel = client.channels.cache.get(data.Channel);
        if (!LogChannel) return;
        embed.setTimestamp();

        try {
            await LogChannel.send({ embeds: [embed] });
            loggedMessages.add(uniqueId); // Mark the log as sent
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }
}

function handleLogs(client) {
    client.on("messageDelete", async (message) => {
        if (message.author.bot) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('Red')
            .setDescription(`
            **Author : ** <@${message.author.id}> - *${message.author.tag}*
            **Date : ** ${message.createdAt}
            **Channel : ** <#${message.channel.id}> - *${message.channel.name}*
            **Deleted Message : **\`${message.content.replace(/`/g, "'")}\`
         `);

        await send_log(client, message.guild.id, embed, `messageDelete_${message.id}`);
    });

    // Other event handlers go here, following the same pattern

     // Channel Topic Updating
     client.on("guildChannelTopicUpdate", async (channel, oldTopic, newTopic) => {
        const embed = new EmbedBuilder()
            .setTitle('Topic Updated!')
            .setColor('Green')
            .setDescription(`${channel} Topic changed from **${oldTopic}** to **${newTopic}**`);

        await send_log(client, channel.guild.id, embed, `guildChannelTopicUpdate_${channel.id}_${new Date().getTime()}`);
    });

    // Channel Permission Updating
    client.on("guildChannelPermissionsUpdate", async (channel, oldPermissions, newPermissions) => {
        const embed = new EmbedBuilder()
            .setTitle('Permission Updated!')
            .setColor('Green')
            .setDescription(`${channel.name}'s permissions updated!`);

        await send_log(client, channel.guild.id, embed, `guildChannelPermissionsUpdate_${channel.id}_${new Date().getTime()}`);
    });

    // unhandled Guild Channel Update
    client.on("unhandledGuildChannelUpdate", async (oldChannel, newChannel) => {
        const embed = new EmbedBuilder()
            .setTitle('Channel Updated!')
            .setColor('Green')
            .setDescription(`Channel '${oldChannel.id}' was edited but discord-logs couldn't find what was updated...`);

        await send_log(client, oldChannel.guild.id, embed, `unhandledGuildChannelUpdate_${oldChannel.id}_${new Date().getTime()}`);
    });

    // Member Started Boosting
    client.on("guildMemberBoost", async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('User Started Boosting!')
            .setColor('Pink')
            .setDescription(`**${member.user.tag}** has started boosting ${member.guild.name}!`);

        await send_log(client, member.guild.id, embed, `guildMemberBoost_${member.id}_${new Date().getTime()}`);
    });

    // Member Unboosted
    client.on("guildMemberUnboost", async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('User Stopped Boosting!')
            .setColor('Pink')
            .setDescription(`**${member.user.tag}** has stopped boosting ${member.guild.name}!`);

        await send_log(client, member.guild.id, embed, `guildMemberUnboost_${member.id}_${new Date().getTime()}`);
    });

    // Member Got Role
    client.on("guildMemberRoleAdd", async (member, role) => {
        const embed = new EmbedBuilder()
            .setTitle('User Got Role!')
            .setColor('Green')
            .setDescription(`**${member.user.tag}** got the role \`${role.name}\``);

        await send_log(client, member.guild.id, embed, `guildMemberRoleAdd_${member.id}_${role.id}`);
    });

    // Member Lost Role
    client.on("guildMemberRoleRemove", async (member, role) => {
        const embed = new EmbedBuilder()
            .setTitle('User Lost Role!')
            .setColor('Red')
            .setDescription(`**${member.user.tag}** lost the role \`${role.name}\``);

        await send_log(client, member.guild.id, embed, `guildMemberRoleRemove_${member.id}_${role.id}`);
    });

    // Nickname Changed
    client.on("guildMemberNicknameUpdate", async (member, oldNickname, newNickname) => {
        const embed = new EmbedBuilder()
            .setTitle('Nickname Updated')
            .setColor('Green')
            .setDescription(`${member.user.tag} changed nickname from \`${oldNickname}\` to \`${newNickname}\``);

        await send_log(client, member.guild.id, embed, `guildMemberNicknameUpdate_${member.id}_${new Date().getTime()}`);
    });

    // Member Joined
    client.on("guildMemberAdd", async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('User Joined')
            .setColor('Green')
            .setDescription(`Member: ${member.user} (\`${member.user.id}\`)\n\`${member.user.tag}\``,
                member.user.displayAvatarURL({ dynamic: true }));

        await send_log(client, member.guild.id, embed, `guildMemberAdd_${member.id}`);
    });

    // Member Left
    client.on("guildMemberRemove", async (member) => {
        const embed = new EmbedBuilder()
            .setTitle('User Left')
            .setColor('Red')
            .setDescription(`Member: ${member.user} (\`${member.user.id}\`)\n\`${member.user.tag}\``,
                member.user.displayAvatarURL({ dynamic: true }));

        await send_log(client, member.guild.id, embed, `guildMemberRemove_${member.id}`);
    });

    // Server Boost Level Up
    client.on("guildBoostLevelUp", async (guild, oldLevel, newLevel) => {
        const embed = new EmbedBuilder()
            .setTitle('Server Boost Level Up')
            .setColor('Pink')
            .setDescription(`${guild.name} reached the boost level ${newLevel}`);

        await send_log(client, guild.id, embed, `guildBoostLevelUp_${guild.id}_${newLevel}`);
    });

    // Server Boost Level Down
    client.on("guildBoostLevelDown", async (guild, oldLevel, newLevel) => {
        const embed = new EmbedBuilder()
            .setTitle('Server Boost Level Down')
            .setColor('Pink')
            .setDescription(`${guild.name} lost a level from ${oldLevel} to ${newLevel}`);

        await send_log(client, guild.id, embed, `guildBoostLevelDown_${guild.id}_${newLevel}`);
    });

    // Banner Added
    client.on("guildBannerAdd", async (guild, bannerURL) => {
        const embed = new EmbedBuilder()
            .setTitle('Server Got a new banner')
            .setColor('Green')
            .setImage(bannerURL);

        await send_log(client, guild.id, embed, `guildBannerAdd_${guild.id}_${new Date().getTime()}`);
    });

    // AFK Channel Added
    client.on("guildAfkChannelAdd", async (guild, afkChannel) => {
        const embed = new EmbedBuilder()
            .setTitle('AFK Channel Added')
            .setColor('Green')
            .setDescription(`${guild.name} has a new afk channel ${afkChannel}`);

        await send_log(client, guild.id, embed, `guildAfkChannelAdd_${guild.id}_${afkChannel.id}`);
    });

    // Guild Vanity Add
    client.on("guildVanityURLAdd", async (guild, vanityURL) => {
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link Added')
            .setColor('Green')
            .setDescription(`${guild.name} has a vanity link ${vanityURL}`);

        await send_log(client, guild.id, embed, `guildVanityURLAdd_${guild.id}_${vanityURL}`);
    });

    // Guild Vanity Remove
    client.on("guildVanityURLRemove", async (guild, vanityURL) => {
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link Removed')
            .setColor('Red')
            .setDescription(`${guild.name} has removed its vanity URL ${vanityURL}`);

        await send_log(client, guild.id, embed, `guildVanityURLRemove_${guild.id}_${vanityURL}`);
    });

    // Guild Vanity Link Updated
    client.on("guildVanityURLUpdate", async (guild, oldVanityURL, newVanityURL) => {
        const embed = new EmbedBuilder()
            .setTitle('Vanity Link Updated')
            .setColor('Yellow')
            .setDescription(`${guild.name} has changed its vanity URL from ${oldVanityURL} to ${newVanityURL}`);

        await send_log(client, guild.id, embed, `guildVanityURLUpdate_${guild.id}_${newVanityURL}`);
    });

    // Member Role Permissions Updated
    client.on("rolePositionUpdate", async (role, oldPosition, newPosition) => {
        const embed = new EmbedBuilder()
            .setTitle('Role Position Updated')
            .setColor('Yellow')
            .setDescription(`${role.name} has changed position from ${oldPosition} to ${newPosition}`);

        await send_log(client, role.guild.id, embed, `rolePositionUpdate_${role.id}_${new Date().getTime()}`);
    });

    // Role Permissions Updated
    client.on("rolePermissionsUpdate", async (role, oldPermissions, newPermissions) => {
        const embed = new EmbedBuilder()
            .setTitle('Role Permission Updated')
            .setColor('Yellow')
            .setDescription(`${role.name} has had a permission update`);

        await send_log(client, role.guild.id, embed, `rolePermissionsUpdate_${role.id}_${new Date().getTime()}`);
    });

    // Username Updated
    client.on("userUsernameUpdate", async (user, oldUsername, newUsername) => {
        const embed = new EmbedBuilder()
            .setTitle('Username Updated')
            .setColor('Yellow')
            .setDescription(`${user.tag} updated their username from ${oldUsername} to ${newUsername}`);

        await send_log(client, user.guild.id, embed, `userUsernameUpdate_${user.id}_${new Date().getTime()}`);
    });

    // Discriminator Updated
    client.on("userDiscriminatorUpdate", async (user, oldDiscriminator, newDiscriminator) => {
        const embed = new EmbedBuilder()
            .setTitle('User Tag Updated')
            .setColor('Yellow')
            .setDescription(`${user.tag} updated their discriminator from ${oldDiscriminator} to ${newDiscriminator}`);

        await send_log(client, user.guild.id, embed, `userDiscriminatorUpdate_${user.id}_${new Date().getTime()}`);
    });

    // Avatar Updated
    client.on("userAvatarUpdate", async (user, oldAvatarURL, newAvatarURL) => {
        const embed = new EmbedBuilder()
            .setTitle('User Avatar Updated')
            .setColor('Yellow')
            .setDescription(`${user.tag} updated their avatar`)
            .setImage(newAvatarURL);

        await send_log(client, user.guild.id, embed, `userAvatarUpdate_${user.id}_${new Date().getTime()}`);
    });

    // Member Joined Voice Channel
    client.on("voiceChannelJoin", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Joined')
            .setColor('Green')
            .setDescription(`${member.user.tag} joined voice channel ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelJoin_${member.id}_${channel.id}`);
    });

    // Member Left Voice Channel
    client.on("voiceChannelLeave", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Left')
            .setColor('Red')
            .setDescription(`${member.user.tag} left voice channel ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelLeave_${member.id}_${channel.id}`);
    });

    // Member Switched Voice Channel
    client.on("voiceChannelSwitch", async (member, oldChannel, newChannel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Switched')
            .setColor('Yellow')
            .setDescription(`${member.user.tag} moved from ${oldChannel.name} to ${newChannel.name}`);

        await send_log(client, oldChannel.guild.id, embed, `voiceChannelSwitch_${member.id}_${oldChannel.id}_${newChannel.id}`);
    });

    // Voice Channel Mute
    client.on("voiceChannelMute", async (member, muteType) => {
        const embed = new EmbedBuilder()
            .setTitle('User Muted in Voice Channel')
            .setColor('Red')
            .setDescription(`${member.user.tag} got ${muteType} muted`);

        await send_log(client, member.guild.id, embed, `voiceChannelMute_${member.id}_${new Date().getTime()}`);
    });

    // Voice Channel Unmute
    client.on("voiceChannelUnmute", async (member, muteType) => {
        const embed = new EmbedBuilder()
            .setTitle('User Unmuted in Voice Channel')
            .setColor('Green')
            .setDescription(`${member.user.tag} got unmuted from ${muteType} mute`);

        await send_log(client, member.guild.id, embed, `voiceChannelUnmute_${member.id}_${new Date().getTime()}`);
    });

    // Voice Channel Deaf
    client.on("voiceChannelDeaf", async (member, deafType) => {
        const embed = new EmbedBuilder()
            .setTitle('User Deafened in Voice Channel')
            .setColor('Red')
            .setDescription(`${member.user.tag} got ${deafType} deafened`);

        await send_log(client, member.guild.id, embed, `voiceChannelDeaf_${member.id}_${new Date().getTime()}`);
    });

    // Voice Channel Undeaf
    client.on("voiceChannelUndeaf", async (member, deafType) => {
        const embed = new EmbedBuilder()
            .setTitle('User Undeafened in Voice Channel')
            .setColor('Green')
            .setDescription(`${member.user.tag} got undeafened from ${deafType} deaf`);

        await send_log(client, member.guild.id, embed, `voiceChannelUndeaf_${member.id}_${new Date().getTime()}`);
    });

    // User Started Speaking
    client.on("voiceChannelSpeaking", async (member, speaking) => {
        const embed = new EmbedBuilder()
            .setTitle('User Started Speaking in Voice Channel')
            .setColor('Blue')
            .setDescription(`${member.user.tag} started speaking`);

        await send_log(client, member.guild.id, embed, `voiceChannelSpeaking_${member.id}_${new Date().getTime()}`);
    });

    // User Stopped Speaking
    client.on("voiceChannelStopSpeaking", async (member, speaking) => {
        const embed = new EmbedBuilder()
            .setTitle('User Stopped Speaking in Voice Channel')
            .setColor('Grey')
            .setDescription(`${member.user.tag} stopped speaking`);

        await send_log(client, member.guild.id, embed, `voiceChannelStopSpeaking_${member.id}_${new Date().getTime()}`);
    });

    // Voice Channel Joined Broadcast
    client.on("voiceChannelJoinBroadcast", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Broadcast Joined')
            .setColor('Purple')
            .setDescription(`${member.user.tag} joined broadcast in ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelJoinBroadcast_${member.id}_${channel.id}`);
    });

    // Voice Channel Left Broadcast
    client.on("voiceChannelLeaveBroadcast", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Broadcast Left')
            .setColor('Dark Purple')
            .setDescription(`${member.user.tag} left broadcast in ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelLeaveBroadcast_${member.id}_${channel.id}`);
    });

    // Voice Channel Join Stage
    client.on("voiceChannelJoinStage", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Stage Joined')
            .setColor('Light Purple')
            .setDescription(`${member.user.tag} joined stage in ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelJoinStage_${member.id}_${channel.id}`);
    });

    // Voice Channel Leave Stage
    client.on("voiceChannelLeaveStage", async (member, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Stage Left')
            .setColor('Deep Purple')
            .setDescription(`${member.user.tag} left stage in ${channel.name}`);

        await send_log(client, channel.guild.id, embed, `voiceChannelLeaveStage_${member.id}_${channel.id}`);
    });

    // Role Created
    client.on("roleCreate", async (role) => {
        const embed = new EmbedBuilder()
            .setTitle('Role Created')
            .setColor('Green')
            .setDescription(`Role ${role.name} was created`);

        await send_log(client, role.guild.id, embed, `roleCreate_${role.id}_${new Date().getTime()}`);
    });

    // Role Deleted
    client.on("roleDelete", async (role) => {
        const embed = new EmbedBuilder()
            .setTitle('Role Deleted')
            .setColor('Red')
            .setDescription(`Role ${role.name} was deleted`);

        await send_log(client, role.guild.id, embed, `roleDelete_${role.id}_${new Date().getTime()}`);
    });

    // User Kicked
client.on("guildMemberRemove", async (member) => {
    const embed = new EmbedBuilder()
        .setTitle('User Kicked')
        .setColor('Red')
        .setDescription(`${member.user.tag} was kicked from the server`);

    await send_log(client, member.guild.id, embed, `userKick_${member.id}_${new Date().getTime()}`);
});

// User Banned
client.on("guildBanAdd", async (guild, user) => {
    const embed = new EmbedBuilder()
        .setTitle('User Banned')
        .setColor('Red')
        .setDescription(`${user.tag} was banned from the server`);

    await send_log(client, guild.id, embed, `userBan_${user.id}_${new Date().getTime()}`);
});
}

module.exports = { handleLogs };