import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DistributionRulesService } from './distribution-rules.service';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Controller('distribution-rules')
export class DistributionRulesController {
  constructor(
    private readonly distributionRulesService: DistributionRulesService,
  ) {}

  @Get('factor-descriptions')
  async getFactorDescriptions(
    @Query('empresa') empresa: string,
  ): Promise<ServiceResponse<string[]>> {
    if (!empresa) {
      throw new HttpException(
        'El parámetro empresa es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await this.distributionRulesService.getFactorDescriptions(empresa);
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener las reglas de distribución',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
