import { Module } from '@nestjs/common';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { QueryMovementsHelper } from '../helpers/query-movements';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [MovementsController],
  imports: [DatabaseModule],
  providers: [MovementsService, QueryMovementsHelper],
  exports: [MovementsService],
})
export class MovementsModule {}
