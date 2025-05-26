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
  FindByEmailDto,
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

  @Get('by-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findByEmail(@Query() query: FindByEmailDto) {
    return this.expenseRequestsService.findByEmail(query.email);
  }

  @Get('dispersed/by-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findDispersedByEmail(@Query() query: FindByEmailDto) {
    return this.expenseRequestsService.findDispersedByEmail(query.email);
  }

  @Get(':id/approve')
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Query('comment') comment?: string,
  ) {
    try {
      const result = await this.expenseRequestsService.approveRequest(
        id,
        approverId,
        comment,
      );
      return {
        success: true,
        message: 'Solicitud aprobada correctamente',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al aprobar la solicitud',
      };
    }
  }

  @Get(':id/reject')
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Query('comment') comment?: string,
  ) {
    try {
      const result = await this.expenseRequestsService.rejectRequest(
        id,
        approverId,
        comment,
      );
      return {
        success: true,
        message: 'Solicitud rechazada correctamente',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al rechazar la solicitud',
      };
    }
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
