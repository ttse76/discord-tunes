exports.send = async (client, channelId, msg) => {
  const channel = await client.channels.cache.get(channelId);
  channel.send(msg);
};
