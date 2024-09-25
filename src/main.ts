import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeederService } from './products/seeder.service';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const seeder = app.get(SeederService);
  await seeder.seed();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: process.env.BASE_URL,
  });
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('API for an e-commerce platform')
    .setVersion('1.0')
    .addTag('auth', 'All auth related endpoints')
    .addTag('payment', 'All payment related endpoints')
    .addTag('cart', 'All cart related endpoints')
    .addTag('products', 'All products related endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
