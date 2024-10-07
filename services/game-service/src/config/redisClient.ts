import { createClient } from 'redis'

const urlRedis = `redis://${process.env.REDIS_HOST}:6379`;

const redis = createClient({ url: urlRedis })
redis.on('error', (err) => {
    console.log(JSON.stringify(process.env));
    console.log('Redis Client Error', err)});

export const initRedis = async () => {
    await redis.connect();
}

export default redis;