import app from '../app';
import http from 'http';
import { initRepositories } from '../repositories/setup';
import rabbitMqClient from '../config/rabbitmqClient';
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initRepositories();
rabbitMqClient.initRabbit();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    console.log('Server closed');
  });
});

export default server;