const { Guild } = require('../classes/Guild');

var MASTER_QUEUE = {};

const isGuildQueueActive = (guildId) => {
  return Object.keys(MASTER_QUEUE).includes(guildId)
};

/**
 * add song to queue. if no queue for guild exists, new queue is created
 * @param {*} song song object
 * @param {Guild} guildId server id
 */
exports.addToQueue = (song, guildId) => {
  if(!isGuildQueueActive(guildId)){
    MASTER_QUEUE[guildId] = new Guild(guildId);
  }

  MASTER_QUEUE[guildId].add(song);
};

exports.getNext = (guildId) => {
  if(!isGuildQueueActive(guildId)){
    return null;
  }

  const song = MASTER_QUEUE[guildId].getNext();

  if(song === undefined){
    delete MASTER_QUEUE[guildId];
    return null;
  }
  return song.videoInfo;
};

exports.getQueueLength = (guildId) => {
  if(!isGuildQueueActive(guildId)){
    return 0;
  }

  return MASTER_QUEUE[guildId].numInQueue;
};

exports.clearQueue = (guildId) => {
  delete MASTER_QUEUE[guildId];
};

// song.videoInfo.videoDetails.title
exports.getQueue = (guildId) => {
  if(!isGuildQueueActive(guildId) || MASTER_QUEUE[guildId].queue.length === 0){
    return 'Queue is empty!';
  }
  const queue = MASTER_QUEUE[guildId].queue;
  var response = 'Queue:\n'
  for(var i = 0; i < queue.length; i++) {
    const song = queue[i];
    response += `${i + 1}. ${song.videoInfo.title}\n`;
  }

  return response;
};