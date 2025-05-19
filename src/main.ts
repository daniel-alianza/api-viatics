import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { exec } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  exec('curl ifconfig.me', (error, stdout, stderr) => {
    if (error) {
      Logger.error(`Error al obtener la IP: ${stderr}`);
    } else {
      Logger.log(`IP pública del servidor: ${stdout.trim()}`);
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  Logger.log(`El servidor esta corriendo en: http://localhost:${port}`);
}
bootstrap();
