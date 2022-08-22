const audioPlayer = require('../audio/audio-player');

const logger = require('../utils/logger');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

const getVoiceChannelId = (interaction) => {
  const guild = client.guilds.cache.get(interaction.guildId);
  const member = guild.members.cache.get(interaction.member.user.id);
  return member.voice.channelId;
};

client.on('ready', async () => {
  await logger.initializeLogger(client);
});

client.on('interactionCreate', async interaction => {
  if(!interaction.isCommand()) return;

  // get guild information
  const guild = client.guilds.cache.get(interaction.guildId);

  // get voice channel id user is connected to
  const voiceChannelId = getVoiceChannelId(interaction);

  // if voiceChannelId is null, user is not in a voice channel
  if(!voiceChannelId){
    await interaction.reply('You must be in a voice channel to play audio!');
    return;
  }
  
  const { commandName, options } = interaction;

  logger.logInfo(`processing interaction { commandName: ${commandName}, params: ${options.getString('query')}, user: ${interaction.user.username}, guild: ${interaction.guildId} }`);

  // determine which action to take based on command
  switch(commandName) {
    case 'play':
      try{
        const searchQuery = options.getString('query');

        await audioPlayer.playSong(client, guild, interaction.channelId, voiceChannelId, searchQuery);
        await interaction.reply(`Processing ${commandName} command...`);
      }catch(err){
        logger.logError('error on play');
        logger.logError(err);

        if(interaction.isRepliable()){
          await interaction.reply(`Error playing ${options.getString('query')}: ${err}`)
        }
      }
      break;
    
    case 'stop':
      try{
        await audioPlayer.stopPlayer(guild, interaction);
      }catch(err){
        logger.logError('error on stop');
        logger.logError(err);
      }
      break;

    case 'skip':
      try{
        await interaction.reply('Skipping Song...')
        await audioPlayer.skip(client, guild, interaction.channelId, voiceChannelId);
      }catch(err){
        logger.logError('error on skip');
        logger.logError(err);
      }
      break;
    
    case 'pause':
      try{
        const returnMessage = await audioPlayer.pause(guild.id);
        await interaction.reply(returnMessage);
      }catch(err){
        logger.logError('error on pause');
        logger.logError(err);
      }
      break;
    
    case 'queue':
      try{
        const queue = audioPlayer.getQueue(guild.id);
        await interaction.reply(queue);
      }catch(err){
        logger.logError('error on queue');
        logger.logError(err);
      }
      break;

    default:
      await interaction.reply('Invalid command');
  }
});

client.on('error', (error) => {
  logger.logError(error);
});

/**
 * initialize client
 * @param {*} token discord api token
 */
exports.initializeClient = (token) => {
  client.login(token);
};
