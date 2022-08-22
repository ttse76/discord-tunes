const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  getVoiceConnection,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require('@discordjs/voice');

const play = require('play-dl');

const scdl = require('soundcloud-downloader').default;

const providers = require('../utils/providers').providers;

const logger = require('../utils/logger');
const messageBus = require('../utils/message-bus');
const queueManager = require('../utils/queue-manager');

/**
 * {
 *    id: 12345,
 *    queue: [song0, song1,...]
 * }
 */
var GUILD_PLAYERS = {};

var AUDIO_PLAYER_STATUS = AudioPlayerStatus.Idle;

const isGuildPlayerActive = (guildId) => {
  return Object.keys(GUILD_PLAYERS).includes(guildId);
};

const createGuildPlayer = (guildId) => {
  GUILD_PLAYERS[guildId] = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play }});
  return GUILD_PLAYERS[guildId];
};

const getGuildPlayer = (guildId) => {
  return GUILD_PLAYERS[guildId];
};

const toQueueObject = (channelId, videoInfo, provider) => {
  return { channelId: channelId, videoInfo: videoInfo, provider: provider }
};

const toYoutubeObject = async (searchQuery, channelId) => {
  if(searchQuery.includes('.com')){
    searchQuery = searchQuery.split('&')[0];
  }

  const songInfos = await play.search(searchQuery, { limit: 1 });
  const songInfo = songInfos.length > 0 ? songInfos[0] : null;
  const queueObj = toQueueObject(channelId, songInfo, providers.YOUTUBE);
  return queueObj;
};

const toSoundCloudObject = async(searchQuery, channelId) => {
  const songInfo = await scdl.getInfo(searchQuery);
  return toQueueObject(channelId, songInfo, providers.SOUNDCLOUD);
};

const getProvider = (searchQuery) => {
  if(searchQuery.toLowerCase().contains(providers.YOUTUBE)) {
    return providers.YOUTUBE;
  }

  if(searchQuery.toLowerCase().contains(providers.SOUNDCLOUD)) {
    return providers.SOUNDCLOUD;
  }

  return providers.YOUTUBE;
};

const getQueueObject = async (searchQuery, channelId) => {
  const provider = getProvider(searchQuery);

  switch(provider) {
    case providers.YOUTUBE:
      return await toYoutubeObject(searchQuery, channelId);
    case providers.SOUNDCLOUD:
      return toSoundCloudObject(searchQuery, channelId);
    default:
      return await toYoutubeObject(searchQuery, channelId);
  }
};

/**
 * Plays song from searchQuery. If song is already playing, song is added to queue
 * @param {*} client representing the bot client
 * @param {*} guild server request is being made from
 * @param {*} interaction interaction information
 * @param {*} voiceChannelId id of voice channel the user is in
 * @param {*} searchQuery url of video. null if going to next song in queue
 */
exports.playSong = async (client, guild, channelId, voiceChannelId, searchQuery) => {
  if(searchQuery === null && queueManager.getQueueLength(guild.id) === 0) {
    logger.logInfo('queue empty');
    return;
  };

  if(searchQuery !== null){
    // get song info
    const songInfo = await getQueueObject(searchQuery, channelId);
    queueManager.addToQueue(songInfo, guild.id);

    // if audio is currently playing, add song to guild queue and return
    if(AUDIO_PLAYER_STATUS === AudioPlayerStatus.Playing) {
      await messageBus.send(client, channelId, `Adding ${songInfo.videoInfo.title} to queue`);
      logger.logInfo(`adding ${songInfo.videoInfo.title} to queue`);
      return;
    }
  }

  const nextSong = queueManager.getNext(guild.id);
  var voiceConnection = getVoiceConnection(guild.id);

  if(!voiceConnection) {
    logger.logInfo(`creating voice connection in guild ${guild.id}`);
    voiceConnection = joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    });
  }

  const stream = await play.stream(nextSong.url);

  const resource = createAudioResource(stream.stream, {
    volume: 1,
    inputType: stream.type
  });

  const guildPlayer = createGuildPlayer(guild.id);
  guildPlayer.play(resource);
  voiceConnection.subscribe(guildPlayer);

  logger.logInfo(`playing "${nextSong.title}"`);
  await messageBus.send(client, channelId, `Now Playing: ${nextSong.title}`);

  guildPlayer.on(AudioPlayerStatus.Idle, async () => {
    AUDIO_PLAYER_STATUS = AudioPlayerStatus.Idle;
    await this.playSong(client, guild, channelId, voiceChannelId, null);
  });

  guildPlayer.on(AudioPlayerStatus.Playing, async () => {
    AUDIO_PLAYER_STATUS = AudioPlayerStatus.Playing;
  });
};

exports.skip = async(client, guild, channelId, voiceChannelId) => {
  if(queueManager.getQueueLength(guild.id) === 0){
    await messageBus.send(client, channelId, 'Queue is empty!');
  }
  await this.playSong(client, guild, channelId, voiceChannelId, null);
};

exports.pause = async(guildId) => {
  const player = getGuildPlayer(guildId);
  const didPause = player.pause();

  if(!didPause) {
    player.unpause();
    logger.logInfo('resuming audio...');
    return 'Resuming audio';
  }
  logger.logInfo('pausing audio...');
  return 'Paused audio';
};

exports.stopPlayer = async (guild, interaction) => {
  queueManager.clearQueue(guild.id);
  const guildPlayer = isGuildPlayerActive(guild.id) ? getGuildPlayer(guild.id) : null;

  const voiceConnection = getVoiceConnection(guild.id);
  if(!voiceConnection){
    await interaction.reply('Player already off');
    return;
  }

  if(guildPlayer !== null){
   guildPlayer.stop(); 
  }
  voiceConnection.destroy();
  logger.logInfo('stopping audio');
  await interaction.reply('Stopping Audio');
};

exports.getQueue = (guildId) => {
  const res = queueManager.getQueue(guildId);
  return res
};