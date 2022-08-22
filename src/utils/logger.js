const config = require('./config-manager');

var CHANNEL;

exports.initializeLogger = async (client) => {
  const channelId = config.getLoggerChannelId();
  if(channelId === undefined || channelId === "" || channelId === null){
    console.log(`[INFO] logger channel id not set`);
    console.log('[INFO] player online');
    CHANNEL = undefined;
    return;
  }
  CHANNEL = await client.channels.cache.get(channelId);
  this.logInfo('player online');
}

exports.logInfo = (msg) => {
  const log = `[INFO] ${msg}`;
  if(CHANNEL){
    CHANNEL.send({ content: log})
  }else{
    console.log(log);
  }
};

exports.logError = (msg) => {
  const log = `[ERROR] ${msg}`;
  console.log(log);
  
  if(CHANNEL){
    CHANNEL.send({ content: `[ERROR] ${msg}`});
  }
};