import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ExpenseRequestsService } from './expense-requests.service';
import { CreateExpenseRequestDto } from './types';

@Controller('expense-requests')
export class ExpenseRequestsController {
  constructor(
    private readonly expenseRequestsService: ExpenseRequestsService,
  ) {}

  @Post()
  create(@Body() createExpenseRequestDto: CreateExpenseRequestDto) {
    return this.expenseRequestsService.create(createExpenseRequestDto);
  }

  @Get()
  findAll() {
    return this.expenseRequestsService.findAll();
  }

  @Get(':id/approve')
  async approveRequest(
    @Param('id') id: string,
    @Query('approverId') approverId: string,
    @Query('comment') comment?: string,
  ) {
    return this.expenseRequestsService.approveRequest(
      parseInt(id),
      parseInt(approverId),
      comment,
    );
  }

  @Get(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Query('approverId') approverId: string,
    @Query('comment') comment?: string,
  ) {
    return this.expenseRequestsService.rejectRequest(
      parseInt(id),
      parseInt(approverId),
      comment,
    );
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: { status: string },
  ) {
    return this.expenseRequestsService.updateStatus(
      parseInt(id),
      updateDto.status,
    );
  }
}
