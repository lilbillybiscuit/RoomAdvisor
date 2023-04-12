const redis = require('redis');
const config = require('@config');

const redisClient = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;
