import { Module } from '@nestjs/common';
import { ComprobacionesController } from './comprobaciones.controller';
import { ComprobacionesService } from './comprobaciones.service';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [],
  controllers: [ComprobacionesController],
  providers: [ComprobacionesService, PrismaClient],
  exports: [ComprobacionesService],
})
export class ComprobacionesModule {}
