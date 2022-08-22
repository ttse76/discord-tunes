const config = require('../utils/config-manager');

if(!config.getClientId()){
  console.log('[ERROR] no client id specified');
  return;
}

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play')
    .addStringOption(option => option.setName('query').setDescription('Search Query').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop'),
  
  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip'),
  
  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause'),
  
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See queue'),
].map(command => command.toJSON());

if(!config.getToken()){
  console.log('[ERROR] bot token not found. exiting...');
  process.exit();
}

const rest = new REST({version: '9' }).setToken(config.getToken());

if(config.getDevGuildId()){
  rest.put(Routes.applicationGuildCommands(config.getClientId(), config.getDevGuildId()), { body: commands })
    .then(() => console.log('Successfully registered commands to dev server'))
    .catch(console.error);
}

if(config.getMainGuildId()){
  rest.put(Routes.applicationGuildCommands(config.getClientId(), config.getMainGuildId()), { body: commands })
    .then(() => console.log('Successfully registered commands to main server'))
    .catch(console.error);
}

/*rest.put(Routes.applicationCommands(config.getClientId()), { body: commands })
  .then(() => console.log('Successfully registered global commands'))
  .catch(console.error);*/