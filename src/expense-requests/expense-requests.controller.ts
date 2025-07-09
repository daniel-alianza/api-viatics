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

  @Post(':id/approve')
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Body('comment') comment?: string,
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

  @Post(':id/reject')
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Query('approverId', ParseIntPipe) approverId: number,
    @Body('comment') comment?: string,
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

  @Get(':id/approve')
  async approveRequestGet(
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
      // Buscar datos del jefe inmediato y colaborador
      const colaborador = result.user?.name || 'el colaborador';
      let jefeEmail: string | null = null;
      if (result.user?.managerId) {
        const manager = await this.expenseRequestsService[
          'prisma'
        ].user.findUnique({
          where: { id: result.user.managerId },
        });
        jefeEmail = manager?.email ?? null;
      }
      // Enviar correo de confirmación al jefe inmediato
      if (jefeEmail) {
        await this.expenseRequestsService['mailService'].enviarCorreo({
          to: jefeEmail,
          subject: 'Confirmación de aprobación de viáticos',
          template: 'approvalConfirmation',
          context: {
            colaborador,
            resultado: 'aprobado',
            esRechazo: false,
          },
        });
      }
      // No retornar página ni redirigir
      return '';
    } catch (error) {
      return '';
    }
  }

  @Get(':id/reject')
  async rejectRequestGet(
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
      // Buscar datos del jefe inmediato y colaborador
      const colaborador = result.user?.name || 'el colaborador';
      let jefeEmail: string | null = null;
      if (result.user?.managerId) {
        const manager = await this.expenseRequestsService[
          'prisma'
        ].user.findUnique({
          where: { id: result.user.managerId },
        });
        jefeEmail = manager?.email ?? null;
      }
      // Enviar correo de confirmación al jefe inmediato
      if (jefeEmail) {
        await this.expenseRequestsService['mailService'].enviarCorreo({
          to: jefeEmail,
          subject: 'Confirmación de rechazo de viáticos',
          template: 'approvalConfirmation',
          context: {
            colaborador,
            resultado: 'rechazado',
            esRechazo: true,
          },
        });
      }
      // No retornar página ni redirigir
      return '';
    } catch (error) {
      return '';
    }
  }
}
