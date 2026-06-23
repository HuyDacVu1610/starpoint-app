"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQListenerConfig = exports.rabbitMQClientConfig = void 0;
const microservices_1 = require("@nestjs/microservices");
const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const queueName = 'starpoint_queue';
exports.rabbitMQClientConfig = [
    {
        name: 'RABBITMQ_CLIENT',
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [rabbitmqUrl],
            queue: queueName,
            queueOptions: {
                durable: true,
            },
        },
    },
];
exports.rabbitMQListenerConfig = {
    transport: microservices_1.Transport.RMQ,
    options: {
        urls: [rabbitmqUrl],
        queue: queueName,
        queueOptions: {
            durable: true,
        },
    },
};
//# sourceMappingURL=rabbitmq.config.js.map