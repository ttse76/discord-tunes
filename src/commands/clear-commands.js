const config = require('../utils/config-manager');

if(!config.getClientId()){
  console.log('[ERROR] client id not found. exiting...');
  process.exit();
}

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

if(!config.getToken()){
  console.log('[ERROR] bot token not found. exiting...');
  process.exit();
}

const rest = new REST({version: '9' }).setToken(config.getToken());

if(config.getDevGuildId()){
  rest.get(Routes.applicationGuildCommands(config.getClientId(), config.getDevGuildId()))
    .then(data => {
      const promises = [];
      for(const command of data) {
        const deleteUrl = `${Routes.applicationGuildCommands(config.getClientId(), config.getDevGuildId())}/${command.id}`
        promises.push(rest.delete(deleteUrl));
      }
      return Promise.all(promises);
    })
    .then(() => console.log('Successfully cleared dev server commands'));
}

if(config.getMainGuildId()){
  rest.get(Routes.applicationGuildCommands(config.getClientId(), config.getMainGuildId()))
    .then(data => {
      const promises = [];
      for(const command of data) {
        const deleteUrl = `${Routes.applicationGuildCommands(config.getClientId(), config.getMainGuildId())}/${command.id}`
        promises.push(rest.delete(deleteUrl));
      }
      return Promise.all(promises);
    })
    .then(() => console.log('Successfully cleared main server commands'));
}

rest.get(Routes.applicationCommands(config.getClientId()))
  .then(data => {
    const promises = [];
    for(const command of data) {
      const deleteUrl = `${Routes.applicationCommands(config.getClientId())}/${command.id}`;
      promises.push(rest.delete(deleteUrl));
    }
    return Promise.all(promises);
  })
  .then(() => console.log('Successfully cleared global server commands'));