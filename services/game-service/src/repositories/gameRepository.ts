import { Repository } from 'redis-om';
import { gameSchema } from '../models/game';
import redis from '../config/redisClient';

export const gameRepository = new Repository(gameSchema, redis);