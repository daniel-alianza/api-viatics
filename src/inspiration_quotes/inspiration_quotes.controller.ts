import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InspirationQuotesService } from './inspiration_quotes.service';
import { CreateInspirationQuoteDto } from './dto/create-inspiration-quote.dto';

@Controller('inspiration-quotes')
export class InspirationQuotesController {
  constructor(
    private readonly inspirationQuotesService: InspirationQuotesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInspirationQuoteDto: CreateInspirationQuoteDto) {
    return this.inspirationQuotesService.create(createInspirationQuoteDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.inspirationQuotesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inspirationQuotesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inspirationQuotesService.remove(id);
  }
}
