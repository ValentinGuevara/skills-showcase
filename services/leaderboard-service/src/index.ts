import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sequelize from './config/sequelizeClient';
import { typeDefs, resolvers } from './graphql';
import { initRabbit } from './config/rabbitmqClient';

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const startServer = async () => {
    await sequelize.sync({ force: false });
    await initRabbit();

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀 Server ready at: ${url}`);
}

startServer();