import { Module } from '@nestjs/common';
import { SalesTaxcodeService } from './sales-taxcode.service';
import { SalesTaxcodeController } from './sales-taxcode.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthSlModule } from '../auth-sl/auth-sl.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthSlModule],
  controllers: [SalesTaxcodeController],
  providers: [SalesTaxcodeService],
  exports: [SalesTaxcodeService],
})
export class SalesTaxcodeModule {}
