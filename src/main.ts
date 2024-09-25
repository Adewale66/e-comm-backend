import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeederService } from './products/seeder.service';
import * as cookieParser from 'cookie-parser';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const seeder = app.get(SeederService);
  await seeder.seed();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use('/api/v1/payment/webhook', raw({ type: 'applicaion/json' }));
  app.enableCors({
    credentials: true,
    origin: process.env.BASE_URL,
  });
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
