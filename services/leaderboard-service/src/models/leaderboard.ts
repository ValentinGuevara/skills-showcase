import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeClient';

export interface LeaderboardType {
    userId: string;
    numberToGuess: number;
    tries: any;
    gameStartedAt: Date;
    gameEndedAt: Date;
}

export class Leaderboard extends Model<LeaderboardType> {}

Leaderboard.init(
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "user_id",
    },
    numberToGuess: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "number_to_guess"
    },
    tries: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    gameStartedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "game_started_at"
    },
    gameEndedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "game_ended_at"
    }
  },
  { sequelize, modelName: 'leaderboard' },
);