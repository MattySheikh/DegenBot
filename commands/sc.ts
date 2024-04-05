import { Message} from 'discord.js';

export const execute = async (params: string, message: Message) => {
	// Make sure the bot has pin permissions in the server lol
	try {
		const { channel } = message;
		const time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
		const msg = await channel.send(`Last clear: ${time}`);
		const currentPinned = await channel.messages.fetchPinned();
		for (const [, curr] of [...currentPinned]) {
			const { content, author: { bot, username } } = curr;
			if (bot && username === 'DegenBot' && (content.startsWith('Last clear: ') || content.startsWith('SWI: '))) {
				curr.unpin();
			}
		}

		await msg.pin();
	} catch (e) {
		console.log('UNABLE TO PIN/SEND SC MESSAGE', e);
	}
}
