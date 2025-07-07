import { Module } from '@nestjs/common';
import { WholesaleAccountsService } from './wholesale-accounts.service';
import { WholesaleAccountsController } from './wholesale-accounts.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthSlService } from 'src/auth-sl/auth-sl.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WholesaleAccountsController],
  providers: [WholesaleAccountsService, AuthSlService],
  exports: [WholesaleAccountsService],
})
export class WholesaleAccountsModule {}
