import { Message} from 'discord.js';

export const execute = async (params: string, message: Message) => {
	const { channel } = message;
	channel.send(`https://www.neopets.com/objects.phtml?obj_type=${params}&type=shop`);
}