import amqplib, { Connection } from 'amqplib';

const exchange = "guesser";
const routingKey = "services.leaderboard";

let conn: Connection;

const initRabbit = async () => {
  conn = await amqplib.connect(`amqp://${process.env["RABBIT_USER"]}:${process.env["RABBIT_PASSWORD"]}@${process.env["RABBIT_HOST"]}:5672/`);
}

const sendBrokerMessage = async (data: any) => {
  const channel = await conn.createChannel();
  await channel.assertExchange(exchange, "topic");
  
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
}

export default {
  initRabbit,
  sendBrokerMessage
}