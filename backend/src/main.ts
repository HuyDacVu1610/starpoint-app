import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ResponseInterceptor } from './shared/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './shared/common/filters/global-exception.filter';
import { rabbitMQListenerConfig } from './shared/config/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Connect and start RabbitMQ microservice
  app.connectMicroservice(rabbitMQListenerConfig);
  await app.startAllMicroservices();

  // Serve static uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Security Headers
  app.use(helmet());

  // CORS config
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Prefix for API Versioning
  app.setGlobalPrefix('api/v1');

  // Input validation and DTO transformations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Response Interceptor and Exception Filter
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}/api/v1`);
}
void bootstrap();
