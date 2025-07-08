import { Module } from '@nestjs/common';
import { DistributionRulesService } from './distribution-rules.service';
import { DistributionRulesController } from './distribution-rules.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthSlModule } from '../auth-sl/auth-sl.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthSlModule],
  controllers: [DistributionRulesController],
  providers: [DistributionRulesService],
  exports: [DistributionRulesService],
})
export class DistributionRulesModule {}
