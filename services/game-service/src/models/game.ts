import { Entity, Schema } from 'redis-om'

export const RULES = {
  TIME_LIMIT: [3, 20],
  TRY_NUMBER: 8
} as const;

export const gameAttributes = {
  userId: 'userId',
  numberToGuess: 'numberToGuess',
  tries: 'tries',
  gameStartedAt: 'gameStartedAt'
} as const;

export type GameTry = {
  guess: number,
  atDate: string,
  message: string,
  success: boolean
}

export interface Game extends Entity {
  [gameAttributes.userId]: string,
  [gameAttributes.numberToGuess]: number,
  [gameAttributes.tries]: GameTry[],
  [gameAttributes.gameStartedAt]: string
}

export const gameSchema = new Schema<Game>('game', {
  [gameAttributes.userId]: { type: 'string', indexed: true },
  [gameAttributes.numberToGuess]: { type: 'number' },
  [gameAttributes.tries]: { type: 'string[]' },
  [gameAttributes.gameStartedAt]: { type: 'date' }
});

export const toHiddenGame = (game: Game) => {
  return {
    ...game,
    [gameAttributes.numberToGuess]: undefined
  }
}