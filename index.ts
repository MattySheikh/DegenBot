// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits, REST, Routes, messageLink } from 'discord.js';
import { readdir } from 'fs/promises';
import { join as pathJoin } from 'path';

interface DiscordClient extends Client {
	commands?: Collection<string, any>;
}

interface CommandsResponse {
	id: string;
	name: string;
	description: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEGEN_BOT_TOKEN: string;
      DEGEN_BOT_GUILD_ID: string;
      DEGEN_BOT_CLIENT_ID: string;
    }
  }
}

const login = async () => {
	// Create a new client instance
	const client: DiscordClient = new Client({
		intents: [
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent
		]
	});

	// When the client is ready, run this code (only once).
	// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
	// It makes some properties non-nullable.
	client.once(Events.ClientReady, (readyClient: any) => {
		console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	});

	client.on(Events.InteractionCreate, async (interaction: any) => {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	});

	await registerCommands(client);

	// Log in to Discord with your client's token
	client.login(process.env.DEGEN_BOT_TOKEN);
}

const registerCommands = async (client: DiscordClient) => {
	client.commands = new Collection();

	const commandsPath = pathJoin(__dirname, 'commands');
	const commandFiles = await readdir(commandsPath);

	const commands = [];
	for (const commandFile of commandFiles) {
		const commandFilePath = pathJoin(commandsPath, commandFile);
		const command = require(commandFilePath);
		if (command.data && command.execute) {
			console.log('Registered', command.data.name);
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${commandFilePath} is missing a required "data" or "execute" property.`);
		}
	}

	await deployCommands(commands);
};

const deployCommands = async (commands: string[]) => {
	const rest = new REST().setToken(process.env.DEGEN_BOT_TOKEN || '');
	console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
	const data = await rest.put(
		Routes.applicationGuildCommands(process.env.DEGEN_BOT_CLIENT_ID, process.env.DEGEN_BOT_GUILD_ID),
		{ body: commands },
	) as CommandsResponse[];

	console.log(`Successfully reloaded ${data.length} application (/) commands.`);
}


const init = async () => {
	await login();
};

(async () => {
	try {
		await init();
	} catch (e) {
		console.error('Error during init', e);
	}
})();