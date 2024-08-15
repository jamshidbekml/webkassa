import 'colors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');
  const apiPrefix: string = config.get<string>('API_PREFIX');

  app.enableCors({ origin: '*' });
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    [`/${apiPrefix}/docs`],
    basicAuth({
      users: { munis: `${config.get('SWAGGER_PASSWORD')}` },
      challenge: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Munis Unduruv')
    .setDescription('Munis Unduruv REST API docs')
    .setVersion('0.0.1')
    .addTag('REST API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, () => {
    console.log(`Application is running on: ${port}`.bgGreen.bold);
  });
}
bootstrap();
