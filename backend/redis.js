const RedisStore = require('connect-redis');
const redis = require('redis');
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error',function(error){
  console.error('Error',error);
});
redisClient.on('connect',function(error){
  console.log('Successful meme');
});
redisClient.set("ChannelName","Codespace", redis.print);
redisClient.get("ChannelName", redis.print);