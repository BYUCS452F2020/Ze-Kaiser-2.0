const base = require('../base-commands/base');
const config = require('../config.json');

// I promise this is for a good cause!
const vulgarity = ['damn', 'shit', 'fuck', 'bitch', 'cunt', 'nigger', 'bastard', 'dick', 'pussy', 'fakenaughtyword'];

const filter = (receivedMessage) => {
	if (!receivedMessage.guild) {
		return false;
	}
	const modChannel = receivedMessage.guild.channels.cache.find(channel => channel.name == 'mod-logs');
	for (const word of vulgarity) {
		if (receivedMessage.content.indexOf(word) != -1) {
			receivedMessage.delete().catch((err) => {
				base.sendError(receivedMessage, err);
			});
			receivedMessage.channel.send(`Tsk tsk, ${receivedMessage.author}`, {
				files: ['./misc-files/christian-server.jpg']
			}).catch((err) => {
				base.sendError(receivedMessage, err);
			});

			let modEmbed = new Discord.MessageEmbed().setColor('#F69400');
			modEmbed.setTitle('Glitch in the Matrix');
			if (receivedMessage) {
				modEmbed.addField('Message:', receivedMessage.content);
				modEmbed.addField('Guilty User:', receivedMessage.author);
				modEmbed.addField('Channel:', receivedMessage.channel);
				if (receivedMessage.guild) {
					modEmbed.addField('Server/Guild:', receivedMessage.guild);
				}
				modEmbed.addField('Time:', receivedMessage.createdAt)
			}

			if (modChannel) {
				modChannel.send(modEmbed);
			}
			else {
				config.administrators.forEach(userID => {
					client.users.fetch(userID).then((user) => {
						user.send(modEmbed);
					});
				});
			}
			return false;
		}
	}

	return true;
}

module.exports = {
	filter
}
