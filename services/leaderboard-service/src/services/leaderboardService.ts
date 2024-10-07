import { Leaderboard, LeaderboardType } from "../models/leaderboard"

const getAllResults = async () => {
    return await Leaderboard.findAll();
}

const saveNewResult = async (leaderboard: LeaderboardType) => {
    leaderboard.gameEndedAt = new Date();
    return await Leaderboard.create(leaderboard);
}

export default {
    getAllResults,
    saveNewResult
}