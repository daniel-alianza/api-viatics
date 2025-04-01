import { Module } from '@nestjs/common';
import { ExpenseRequestsController } from './expense-requests.controller';
import { ExpenseRequestsService } from './expense-requests.service';
import { PrismaClient } from '@prisma/client';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ExpenseRequestsController],
  providers: [ExpenseRequestsService, PrismaClient],
})
export class ExpenseRequestsModule {}
