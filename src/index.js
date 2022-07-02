const configManager = require('./utils/config-manager');

if(!configManager.getToken()){
  console.log('[ERROR] bot token not found. exiting...');
  process.exit();
}

if(!configManager.getClientId()){
  console.log('[ERROR] no client id found. exiting...');
  process.exit();
}

const client = require('./discord/client-manager');

client.initializeClient(configManager.getToken());
