import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { version } from '../package.json';
import { INestApplication } from '@nestjs/common';

/**
 * Setup the API docs
 *
 * This function sets up the API docs using the Swagger.
 *
 * @param app - The NestJS application
 * @param options - The Swagger options
 * @param path - The path to the API docs without prefix `/` default is `doc`
 */
function setupApiDocs(app: INestApplication, options?: SwaggerCustomOptions) {
  const path = process.env.SWAGGER_URL ?? 'doc';
  const doc = new DocumentBuilder()
    .setTitle('Panah Server API')
    .setDescription('The Panah Server API documentation')
    .setVersion(version)
    .addBearerAuth()
    .addTag('HealthCheck', 'Application health check')
    .addTag('Auth', 'Auth Module')
    .addTag('Token', 'Token Module')
    .addTag('User', 'User Module')
    .build();

  const document = SwaggerModule.createDocument(app, doc);
  SwaggerModule.setup(path, app, document, options);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const logger = app.get(Logger);
  app.useLogger(logger);

  if (process.env.SWAGGER_DISABLE !== 'true') {
    setupApiDocs(app);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    logger.log(`App listen on ${port}`);

    process.on('SIGTERM', () => {
      const t = setTimeout(() => {
        logger.warn('Timeout, Force Shutdown');
        process.exit(1);
      }, 10_000);

      (async () => {
        await app.close();
        clearTimeout(t);
        logger.log('Graefully Shutdown');
        process.exit(0);
      })().catch((err) => {
        clearTimeout(t);
        logger.error('Cannot Terminate app', err);
        process.exit(1);
      });
    });
  });
}
void bootstrap();
