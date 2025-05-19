import { Module } from '@nestjs/common';
import { ViaticosController } from './viaticos.controller';
import { ViaticosService } from './viaticos.service';
import { QuerySolideviaticosHelper } from '../helpers/query-solideviaticos';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [ViaticosController],
  imports: [DatabaseModule],
  providers: [ViaticosService, QuerySolideviaticosHelper],
  exports: [ViaticosService],
})
export class ViaticosModule {}
