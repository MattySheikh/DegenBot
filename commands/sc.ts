import { Message} from 'discord.js';

export const execute = async (params: string, message: Message) => {
	const { channel } = message;
	channel.send('CLEAR');
}
