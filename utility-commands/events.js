const sqlite = require('../database/sqlite')

const event = (context) => {
	let eventParams = context.args.join(" ");
	const nameRegex = /"(.*?[^\\])"/g;
	let paramMatches = [...eventParams.matchAll(nameRegex)];
	
	const removals = paramMatches.map(m => m[0]);
	removals.forEach(r => eventParams = eventParams.replace(r, "")); // remove the matches from the args
	let args = eventParams.trim().split(" ");

	let command;
	const results = paramMatches.map(m => m[1]);
	if (!results.length) { // no event is named
		command = initializers[args[0]];
	}
	else if (results.length === 1) {
		command = detailers[args[0]];
	}
	else {
		command = (args[0] === "assign") ? detailers[args[0]] : detailers[args.join('')];
	}

	context.matches = paramMatches;
	if (command) {
		command(context);
	}
	else {
		context.message.channel.send("Event command not recognized, refer to the help embed for syntax:");
		help(context);
	}
}

const help = (context) => {
	//note: the help.json will not be accurate until this is all complete, the commands will be slightly different for the dev version
	let allCommands = require('./eventHelp.json');

	let helpEmbed = new Discord.MessageEmbed().setColor('#2295d4');
	Object.keys(allCommands).forEach(command => {
		const currentCommand = allCommands[command];
		helpEmbed.addField(currentCommand.title, currentCommand.description);
	});
	helpEmbed.setFooter("Names of Events and Assignments **MUST** be wrapped in quotation marks for the commands to work correctly!");
	context.message.channel.send(helpEmbed);
}

const createEvent = (context) => {
	const title = context.matches[0][1] || "title";
	const eventData = {
		server_id: context.message.channel.guild.id,
		title: title,
		start_date_time: "today",
		end_date_time: "today but in an hour",
		description: "This is a new event we created",
		creator: context.message.author.id
	}

	sqlite.events.insertEvent(context.db, eventData);
	context.message.channel.send("consider the event created");
}

const listEvents = (context) => {
	const list = sqlite.events.getAllEvents(context.db, context.message.channel.guild.id).then((res) => {
		const toDisplay = res.filter(response => response.server_id === context.message.channel.guild.id);
		if(toDisplay.length)
		{
			context.message.channel.send("Here you go!");
			toDisplay.forEach(row => {
				const message = `
					Id: ${row.event_id}
					title: ${row.title}
					description: ${row.description}
					start: ${row.start_date_time}
					end: ${row.end_date_time}
				`
				context.message.channel.send(message);
			})
			context.message.channel.send("That's all folks");
		}
		else
		{
			context.message.channel.send("Ha, and you thought you had events...");
		}

	}).catch(err => {
		console.log(err)
		context.message.channel.send("Well I tried...");
	})
}

const joinEvent = (context) => {
	const eventId = context.matches[0][1] || 1;
	const attendeeData = {
		user_id: context.message.author.id,
		event_id: eventId
	}
	sqlite.events.insertAttendee(context.db, attendeeData).then(res => {
		context.message.channel.send("consider yourself as attending the event");
	})

}

const assign = (context) => {
	const assignmentId = context.matches[0][1] || 1;
	for(const userId of context.message.mentions.users.keyArray())
	{
		const assigneeData = {
			user_id: userId,
			assignment_id: assignmentId,
			has_accepted: 0
		}
		sqlite.events.insertAssignee(context.db, assigneeData)
	}
	context.message.channel.send("consider them assigned.");

}

const createTask = (context) => {
	const eventId = context.matches[0][1] || 1;
	const attendeeData = {
		event_id: eventId,
		description: "Do all the things!!!"
	}
	sqlite.events.insertAssignment(context.db, attendeeData).then(res => {
		context.message.channel.send("consider the task created");
	})
}

const editTask = (context) => {
	context.message.channel.send("consider the task edited");
}

const listJobs = (context) => {
	const event_id = context.matches[0][1] || "1";
	sqlite.events.getEvent(context.db, event_id, context.message.channel.guild.id).then((res1) => {
		const list = sqlite.events.getAssignmentsForEvent(context.db, event_id).then((res2) => {
			const eventToDisplay = res1;
			const toDisplay = res2;

			if(toDisplay.length)
			{
				context.message.channel.send("Here you go!");
				const eventMessage = `
					Id: ${event_id}
					Event: ${eventToDisplay.title}
					`
				context.message.channel.send(eventMessage);

				toDisplay.forEach(row => {
					const message = `
						assignment_id: ${row.assignment_id}
						description: ${row.description}
					`
					context.message.channel.send(message);
				})
			}
			else
			{
				context.message.channel.send("Ha, and you thought you had jobs...");
			}

		}).catch(err => {
			console.log(err)
			context.message.channel.send("Well I tried...");
		})
		console.log(list)
	}).catch(err => {
		console.log(err)
		context.message.channel.send("Well I tried...");
	})

	context.message.channel.send("consider the jobs listed");
}

const editEvent = (context) => {
	context.message.channel.send("consider the event edited");
}

const removeEvent = (context) => {
	sqlite.events.deleteEvent(context.db, context.matches[0][1])
	context.message.channel.send("Event ~~destroyed~~ removed with great prejudice");
}

const listAttendees = (context) => {
	const event_id = context.matches[0][1]
	sqlite.events.getEvent(context.db, event_id, context.message.channel.guild.id).then((res1) => {
		const list = sqlite.events.getAttendeesForEvent(context.db, event_id).then((res2) => {
			const eventToDisplay = res1;
			const toDisplay = res2;

			if(toDisplay.length)
			{
				context.message.channel.send("Here you go!");
				const eventMessage = `
					Id: ${event_id}
					Event: ${eventToDisplay.title}
					`
				context.message.channel.send(eventMessage);

				toDisplay.forEach(row => {
					const message = `
						user_id: ${row.user_id}
					`
					context.message.channel.send(message);
				})
			}
			else
			{
				context.message.channel.send("Ha, and you thought you had attendees...");
			}

		}).catch(err => {
			console.log(err)
			context.message.channel.send("Well I tried...");
		})
		console.log(list)
	}).catch(err => {
		console.log(err)
		context.message.channel.send("Well I tried...");
	})

	context.message.channel.send("consider the attendees listed");
}

const listAssignees = (context) => {
	const assignment_id = context.matches[0][1]
	const list = sqlite.events.getAssigneesForAssignment(context.db, assignment_id).then((res) => {
	
		const toDisplay = res;

		if(toDisplay.length)
		{
			context.message.channel.send("Here you go!");

			toDisplay.forEach(row => {
				const message = `
					user_id: ${row.user_id}
				`
				context.message.channel.send(message);
			})
		}
		else
		{
			context.message.channel.send("Ha, and you thought you had assignees...");
		}

	}).catch(err => {
		console.log(err)
		context.message.channel.send("Well I tried...");
	})
	console.log(list)


	context.message.channel.send("consider the assignees listed");
}

const initializers = {
	'help': help,
	'create': createEvent,
	'list': listEvents
}

const detailers = {
	'join': joinEvent,
	'assign': assign,
	'taskcreate': createTask,
	'jobcreate': createTask,
	'assignmentcreate': createTask,
	'taskedit': editTask,
	'jobedit': editTask,
	'assignmentedit': editTask,
	'jobs': listJobs,
	'joblist': listJobs,
	'assignments': listJobs,
	'edit': editEvent,
	'create': createEvent,
	'delete': removeEvent,
	'listAttendees': listAttendees,
	'listAssignees': listAssignees,
}

module.exports = {
	event
}