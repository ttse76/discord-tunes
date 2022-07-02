const authConfig = require('../../config/options.json');

exports.getToken = () => {
  return authConfig.token;
};

exports.getClientId = () => {
  return authConfig.clientId;
}

exports.getDevGuildId = () => {
  return authConfig.devGuildId;
}

exports.getMainGuildId = () => {
  return authConfig.mainGuildId;
};

exports.getLoggerChannelId = () => {
  return authConfig.loggerChannel;
};