import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQClientConfig } from '../config/rabbitmq.config';

@Global()
@Module({
  imports: [
    ClientsModule.register(rabbitMQClientConfig),
  ],
  exports: [
    ClientsModule,
  ],
})
export class RabbitMQModule {}
