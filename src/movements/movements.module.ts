import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthSlModule } from '../auth-sl/auth-sl.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
    AuthSlModule,
  ],
  controllers: [MovementsController],
  providers: [MovementsService, PrismaClient],
})
export class MovementsModule {}
