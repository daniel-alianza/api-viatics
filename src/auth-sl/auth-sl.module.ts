import { Module } from '@nestjs/common';
import { AuthSlService } from './auth-sl.service';
import { AuthSlController } from './auth-sl.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AuthSlController],
  providers: [AuthSlService],
  exports: [AuthSlService],
})
export class AuthSlModule {}
