const discord = require("discord.js");
const client = new discord.Client(774474848226246667);
const fs = require("fs");
const DB = require("./db.js");
const app = require("express")();

// KeepAlive
app.get("/", (req, res) => {
	res.end();
})

app.listen(8080);

let commands = {};

let defaultPrefix = '$';

let globals = {
	discord: discord,

	commands: commands,

	makeGuild: function() {
		return { prefix: defaultPrefix, ticketChannels: [] };
	},

	makeEmbed: function() {
		return new discord.MessageEmbed();
	},

	getCommand: function(guild, name) {
		let guilddata = globals.guilds.Get(guild.id);

		if (! guilddata) {
			guilddata = globals.makeGuild();

			globals.guilds.Set(guild.id, guilddata);

			globals.guilds.Save();
		}

		if (! guilddata.prefix) {
			guilddata.prefix = defaultPrefix;

			globals.guilds.Set(guild.id, guilddata);

			globals.guilds.Save();
		}

		if (! name.startsWith(guilddata.prefix))
			return;

		return commands[name.slice(guilddata.prefix.length)];
	}
};

async function InitializeGlobals() {
	globals.db = new DB("db.json");

	globals.guilds = globals.db.Create("guilds");

	await globals.db.Refresh();

	globals.db.Flush();
}

function ReloadCommands() {
	fs.readdir(__dirname + "/commands", (err, files) => {
		if (err) {
			
		}

		for (let file of files) {
			let cmd = require(`${__dirname}/commands/${file}`);

			commands[cmd.name] = cmd;
		}
	})
}

client.on("ready", () => {
	ReloadCommands();
	InitializeGlobals();

	client.user.setPresence({ activity: { name: `Default Prefix '${defaultPrefix}'` } });
});

client.on("message", (msg) => {
	try {
		let spl = msg.content.split(/ +/);

		let cmd = globals.getCommand(msg.guild, spl[0]);

		if (! cmd || msg.bot)
			return;

		cmd.run(globals, msg, spl.splice(1));
	}
	catch (e) {

	}
})

client.login(process.env.Nzc0NDc0ODQ4MjI2MjQ2NjY3.X6YT6A.EMGdnxecr9E_UiD_1mZkObHvXXA);