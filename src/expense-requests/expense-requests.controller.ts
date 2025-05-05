import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ExpenseRequestsService } from './expense-requests.service';
import {
  CreateExpenseRequestDto,
  UpdateExpenseRequestStatusDto,
} from './dto/expense-request.dto';

@Controller('expense-requests')
export class ExpenseRequestsController {
  constructor(
    private readonly expenseRequestsService: ExpenseRequestsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createExpenseRequestDto: CreateExpenseRequestDto) {
    return this.expenseRequestsService.create(createExpenseRequestDto);
  }

  @Get()
  findAll() {
    return this.expenseRequestsService.findAll();
  }

  @Get(':id/approve')
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Query('comment') comment?: string,
  ) {
    return this.expenseRequestsService.approveRequest(id, approverId, comment);
  }

  @Get(':id/reject')
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Query('comment') comment?: string,
  ) {
    return this.expenseRequestsService.rejectRequest(id, approverId, comment);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateExpenseRequestStatusDto,
  ) {
    return this.expenseRequestsService.updateStatus(id, updateDto.status);
  }

  @Patch(':id/disburse')
  async disburseRequest(@Param('id', ParseIntPipe) id: number) {
    return this.expenseRequestsService.updateStatus(id, 'Dispersada');
  }
}
