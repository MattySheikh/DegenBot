import { Client, Message, Events, GatewayIntentBits } from 'discord.js';
import { readdir } from 'fs/promises';
import { join as pathJoin } from 'path';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DEGEN_BOT_TOKEN: string;
			DEGEN_BOT_GUILD_ID: string;
			DEGEN_BOT_CLIENT_ID: string;
		}
	}
}

type MessageHandler = (params: string, message: Message) => Promise<void>;

const start = async () => {
	const client: Client = new Client({
		intents: [
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent
		]
	});

	await registerCommands(client);

	client.once(Events.ClientReady, (readyClient) => {
		console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	});

	client.login(process.env.DEGEN_BOT_TOKEN);
}

const registerCommands = async (client: Client) => {
	const commandsPath = pathJoin(__dirname, 'commands');
	const commandFiles = await readdir(commandsPath);

	const commandHandler: Record<string, MessageHandler> = {};
	for (const commandFile of commandFiles) {
		const [command] = commandFile.split('.ts');
		const commandFilePath = pathJoin(commandsPath, commandFile);
		const { execute } = require(commandFilePath);
		if (execute) {
			console.log('Registered', command);
			commandHandler[command] = execute;
		} else {
			console.log(`[WARNING] The command at ${commandFilePath} is missing a required "execute" export.`);
		}
	}

	client.on(Events.MessageCreate, async (message) => {
		const { content } = message;
		if (!content.startsWith('!')) {
			return;
		}

		const [command, params] = content.split('!')[1].split(' ');

		if (!commandHandler[command]) {
			return;
		}

		commandHandler[command](params, message);
	});
};

(async () => {
	try {
		await start();
	} catch (e) {
		console.error('Error during init', e);
	}
})();