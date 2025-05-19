import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  async getMovementsByCard(
    @Query('cardNumber') cardNumber: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!cardNumber || !startDate || !endDate) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Se requieren cardNumber, startDate y endDate',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.movementsService.getMovementsByCard(
        cardNumber,
        startDate,
        endDate,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error al procesar la solicitud',
          error: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
