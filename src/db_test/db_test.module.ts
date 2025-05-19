import { Module } from '@nestjs/common';
import { DbTestService } from './db_test.service';
import { DbTestController } from './db_test.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DbTestController],
  providers: [DbTestService],
  exports: [DbTestService],
})
export class DbTestModule {}
