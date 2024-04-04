import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder().setName('sc').setDescription('Broadcasts a Shop Clear');

const execute = async (interaction: any) => {
	interaction.reply('CLEAR');
}

export {
	data,
	execute,
}