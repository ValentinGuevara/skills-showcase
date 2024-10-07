import { Request, Response } from 'express';
import { gameRepository } from '../repositories/gameRepository';
import openAIService from '../services/openai';
import { newGameInputSchema } from '../models/inputs/game';
import { Game, gameAttributes, RULES, toHiddenGame } from '../models/game';
import { EntityId } from 'redis-om';
import { suggestSolutionInputSchema } from '../models/inputs/solution';
import { calculateDateDifference, getTimeLimitMs } from '../utils/date';
import rabbitMqClient from '../config/rabbitmqClient';

/** 
 * It’s generally better to use services to interact with the repository.
 * For the sake of simplicity, this is just a quick approach for demonstration purposes.
**/

export const startNew = async (req: Request, res: Response) => {
    try {
        const { userId } = newGameInputSchema.parse(req.body);
        const currentGames = await gameRepository.search().where(gameAttributes.userId).equals(userId).return.all();
        if(currentGames && currentGames.length > 0) {res.status(409).send({ runningGame: currentGames[0][EntityId] }); return;}
        const newNumberToGuess = Math.floor(Math.random() * 1000) + 1; // From 1 to 1000
        let newGame: Game = {
            [gameAttributes.userId]: userId,
            [gameAttributes.numberToGuess]: newNumberToGuess,
            [gameAttributes.tries]: [],
            [gameAttributes.gameStartedAt]: new Date().toISOString()
        }
        newGame = await gameRepository.save(newGame);
        res.status(201).json(toHiddenGame(newGame));
    } catch (err: any) {
        res.status(400).send({ reason: (err as Error).message });
    }
};

export const suggestSolution = async (req: Request, res: Response) => {
    try {
        const { userId, suggestion } = suggestSolutionInputSchema.parse(req.body);
        const now = new Date();
        const currentGames = await gameRepository.search().where(gameAttributes.userId).equals(userId).return.all();
        if(!currentGames || currentGames.length === 0) {res.status(404).send({ reason: "NO_CURRENT_GAME", message: "Start a new game with /startNew" }); return;}
        const game = currentGames[0];
        const { minutes, seconds } = calculateDateDifference(now, new Date(game[gameAttributes.gameStartedAt]));
        if(((minutes * 60 + seconds) * 1000) >= getTimeLimitMs()) {res.status(410).send({ reason: "TOO_LATE", message: `You took ${minutes}m${seconds} to find your number. Limit was ${RULES.TIME_LIMIT[0]}m${RULES.TIME_LIMIT[1]}. Start a new game.` }); return;}
        if(game[gameAttributes.tries].length >= RULES.TRY_NUMBER) {res.status(400).send({ reason: "TOO_MUCH_TRY", message: `You have already suggested ${game[gameAttributes.tries].length} solutions. Start a new game.` }); return;}
        if(game[gameAttributes.numberToGuess] !== suggestion) {
            const hintMessage = await openAIService.promptMyGPT(suggestion, 
                game[gameAttributes.numberToGuess], 
                game[gameAttributes.tries].length, 
                RULES.TRY_NUMBER);
            game[gameAttributes.tries].push({
                guess: suggestion,
                atDate: now.toISOString(),
                message: hintMessage,
                success: false
            });
            res.status(400).send({ reason: "FAIL", message: hintMessage }); 
            await gameRepository.save(game);
            return;
        }
        // Process success message
        game[gameAttributes.tries].push({
            guess: suggestion,
            atDate: now.toISOString(),
            message: "OK",
            success: true
        });
        await rabbitMqClient.sendBrokerMessage(game);
        await gameRepository.remove(game[EntityId] as string);
        res.status(200).json(game);
    } catch (err: any) {
        res.status(400).send({ reason: (err as Error).message });
    }
};
