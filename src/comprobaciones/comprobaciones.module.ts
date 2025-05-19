import { Module } from '@nestjs/common';
import { ComprobacionesController } from './comprobaciones.controller';
import { ComprobacionesService } from './comprobaciones.service';
import { ComprobacionesHelper } from '../helpers/comprobaciones.helper';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ComprobacionesController],
  providers: [ComprobacionesService, ComprobacionesHelper],
  exports: [ComprobacionesService],
})
export class ComprobacionesModule {}
