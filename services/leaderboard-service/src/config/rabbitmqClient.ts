import amqplib, { ConsumeMessage, Channel } from 'amqplib';
import leaderboardService from '../services/leaderboardService';

const exchange = "guesser";
const routingKey = "services.leaderboard";
const queue = "leaderboard";

let channel: Channel;

const processMessage = async (msg: ConsumeMessage) => {
    try {
      if (msg !== null) {
        channel.ack(msg);
        // Only creating entity, calling service from here (NOT PRODUCTION)
        leaderboardService.saveNewResult(JSON.parse(msg.content.toString()));
      } else {
        console.error('Consumer cancelled by server');
      }
    } catch (err) {
      console.error(err);
    }
};

export const initRabbit = async () => {
    const conn = await amqplib.connect(`amqp://${process.env["RABBIT_USER"]}:${process.env["RABBIT_PASSWORD"]}@${process.env["RABBIT_HOST"]}:5672/`);

  channel = await conn.createChannel();
  await channel.assertExchange(exchange, "topic");
  await channel.assertQueue(queue);
  await channel.bindQueue(queue, exchange, routingKey);

  channel.consume(queue, processMessage);
}