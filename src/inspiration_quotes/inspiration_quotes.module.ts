import { Module } from '@nestjs/common';
import { InspirationQuotesService } from './inspiration_quotes.service';

@Module({
  providers: [InspirationQuotesService],
})
export class InspirationQuotesModule {}
