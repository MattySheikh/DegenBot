import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder().setName('swi').setDescription('Broadcasts a Shop With Inventory');

const execute = async (interaction: any) => {
	console.log('-------', interaction);
	interaction.reply('https://www.neopets.com/objects.phtml?obj_type=2&type=shop');
}

export {
	data,
	execute,
}