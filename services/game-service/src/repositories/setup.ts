import { initRedis } from "../config/redisClient";
import { gameRepository } from "./gameRepository";

export const initRepositories = async () => {
    await initRedis();
    await gameRepository.createIndex();
}