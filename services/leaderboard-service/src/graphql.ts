import leaderboardService from './services/leaderboardService';

export const typeDefs = `#graphql
  type Leaderboard {
    id: ID!
    userId: String!
    numberToGuess: Int!
    gameStartedAt: String!
    gameEndedAt: String!
  }

  type Query {
    results: [Leaderboard!]!
  }
`;

export const resolvers = {
  Query: {
    results: async () => await leaderboardService.getAllResults(),
  },
};