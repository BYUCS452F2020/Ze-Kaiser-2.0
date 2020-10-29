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
	context.message.channel.send("consider the event created");
}

const listEvents = (context) => {
	context.message.channel.send("consider the events listed");
}

const joinEvent = (context) => {
	context.message.channel.send("consider yourself as attending the event");
}

const assign = (context) => {
	context.message.channel.send("consider that person assigned.");
}

const createTask = (context) => {
	context.message.channel.send("consider the task created");
}

const editTask = (context) => {
	context.message.channel.send("consider the task edited");
}

const listJobs = (context) => {
	context.message.channel.send("consider the jobs listed");
}

const editEvent = (context) => {
	context.message.channel.send("consider the event edited");
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
	'edit': editEvent
}

module.exports = {
	event
}