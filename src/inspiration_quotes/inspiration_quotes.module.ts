import { Module } from '@nestjs/common';
import { InspirationQuotesService } from './inspiration_quotes.service';
import { InspirationQuotesController } from './inspiration_quotes.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [InspirationQuotesController],
  providers: [
    InspirationQuotesService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
})
export class InspirationQuotesModule {}
