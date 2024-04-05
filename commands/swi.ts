import { Message} from 'discord.js';

export const execute = async (params: string, message: Message) => {
	try {
		const { channel } = message;
		const msg = await channel.send(`SWI: <https://www.neopets.com/objects.phtml?obj_type=${params}&type=shop>`);

		const currentPinned = await channel.messages.fetchPinned();

		let notPinnedYet = true;
		for (const [, curr] of [...currentPinned]) {
			const { content } = curr;
			if (content.startsWith('SWI: ')) {
				const currObj = (content.match('type=(.*)&type') || [])[1];
				if (currObj === params) {
					notPinnedYet = false;
					break;
				}
			}
		}

		if (notPinnedYet) {
			await msg.pin();
		}
	} catch (e) {
		console.log('UNABLE TO PIN/SEND SWI MESSAGE', e);
	}
}