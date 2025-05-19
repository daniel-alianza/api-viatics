import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { QueryMovimientosHelper } from '../helpers/query-movimientos';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MovimientosController],
  providers: [MovimientosService, QueryMovimientosHelper],
})
export class MovimientosModule {}
