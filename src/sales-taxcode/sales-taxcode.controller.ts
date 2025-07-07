import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SalesTaxcodeService } from './sales-taxcode.service';
import { ApiResponse, SimplifiedTaxCode } from './interfaces/taxcode.interface';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Controller('sales-taxcode')
export class SalesTaxcodeController {
  private readonly logger = new Logger(SalesTaxcodeController.name);
  constructor(private readonly salesTaxcodeService: SalesTaxcodeService) {}

  @Get()
  async getTaxCodes(
    @Query('empresa') empresa: string,
  ): Promise<ServiceResponse<Array<{ name: string; code: string }>>> {
    try {
      if (!empresa) {
        throw new HttpException(
          'El parámetro empresa es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.salesTaxcodeService.getTaxCodes(empresa);
      const taxCodesWithNames = result.map((item) => ({
        name: item.Name,
        code: item.Code,
      }));
      return {
        success: true,
        message: 'Operación exitosa',
        data: taxCodesWithNames,
      };
    } catch (error) {
      this.logger.error('Error al obtener códigos de impuesto:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener códigos de impuesto',
          error: {
            code:
              error instanceof HttpException
                ? error.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR,
            message:
              error instanceof Error ? error.message : 'Error desconocido',
            details: error instanceof Error ? error.stack : undefined,
          },
        },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
