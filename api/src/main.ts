import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') ?? true,
  });

  const port = configService.get<string>('PORT') ?? 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo List API')
    .setDescription(
      'API de lista de tarefas com autenticação de usuários.\n\n' +
        '**Autor:** ' +
        '[LinkedIn](https://www.linkedin.com/in/cristiano-da-silva-ferreira/)' +
        ' · ' +
        '[GitHub](https://github.com/CristianoSFMothe)',
    )
    .setVersion('1.0')
    .setContact(
      'Cristiano da Silva Ferreira',
      'https://github.com/CristianoSFMothe',
      '',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(`http://localhost:${port}`, 'Local')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'Paste the access token returned by POST /auth/login',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Raw OpenAPI document (importable into Postman/Insomnia, codegen, etc.)
  app.getHttpAdapter().get('/docs-json', (_req: Request, res: Response) => {
    res.json(document);
  });

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  await app.listen(port);
}

void bootstrap();
