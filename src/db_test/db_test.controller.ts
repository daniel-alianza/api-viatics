import { Controller, Get } from '@nestjs/common';
import { DbTestService } from './db_test.service';

@Controller('db-test')
export class DbTestController {
  constructor(private readonly dbTestService: DbTestService) {}

  @Get('test-sqlserver')
  async testSqlServerConnection() {
    return this.dbTestService.testConnection();
  }
}
