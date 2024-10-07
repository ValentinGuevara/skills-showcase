import { RULES } from "../models/game";

export const calculateDateDifference = (date1: Date, date2: Date): { minutes: number; seconds: number } => {
    const differenceInMillis = date1.getTime() - date2.getTime();
    const totalSeconds = Math.floor(differenceInMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}

export const getTimeLimitMs = () => (60 * RULES.TIME_LIMIT[0] + RULES.TIME_LIMIT[1]) * 1000