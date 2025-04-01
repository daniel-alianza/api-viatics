import {
  Controller,
  Post,
  Body,
  Get,
  // Param,
  // Query,
  // Redirect,
} from '@nestjs/common';
import { ExpenseRequestsService } from './expense-requests.service';
import { CreateExpenseRequestDto } from './types';

@Controller('expense-requests')
export class ExpenseRequestsController {
  constructor(
    private readonly expenseRequestsService: ExpenseRequestsService,
  ) {}

  @Get()
  findAll() {
    return this.expenseRequestsService.findAll();
  }

  @Post()
  create(@Body() createExpenseRequestDto: CreateExpenseRequestDto) {
    return this.expenseRequestsService.create(createExpenseRequestDto);
  }
}
