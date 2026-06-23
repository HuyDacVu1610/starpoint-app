import { ClientsModuleOptions, Transport, MicroserviceOptions } from '@nestjs/microservices';

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const queueName = 'starpoint_queue';

export const rabbitMQClientConfig: ClientsModuleOptions = [
  {
    name: 'RABBITMQ_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: queueName,
      queueOptions: {
        durable: true,
      },
    },
  },
];

export const rabbitMQListenerConfig: MicroserviceOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitmqUrl],
    queue: queueName,
    queueOptions: {
      durable: true,
    },
  },
};
