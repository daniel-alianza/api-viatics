import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ViaticosService } from './viaticos.service';
import { ApiResponse, Viatico } from '../interfaces/database.interface';

@Controller('viaticos')
export class ViaticosController {
  constructor(private readonly viaticosService: ViaticosService) {}

  @Get()
  async getViaticosPorEmail(
    @Query('email') email: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponse<Viatico[]>> {
    try {
      if (!email) {
        throw new HttpException(
          {
            status: 'error',
            message: 'El email es requerido',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.viaticosService.getViaticoPorEmail(email, page, limit);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
