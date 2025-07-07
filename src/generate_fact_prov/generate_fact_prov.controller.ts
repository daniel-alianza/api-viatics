import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GenerateFactProvService } from './generate_fact_prov.service';
import { GenerateFactProvRequestDto } from './dto/generate-fact-prov.dto';

@Controller('generate-fact-prov')
@UsePipes(new ValidationPipe({ transform: true }))
export class GenerateFactProvController {
  constructor(
    private readonly generateFactProvService: GenerateFactProvService,
  ) {}

  @Get('match-card')
  async matchCard(
    @Query('empresa') empresa: string,
    @Query('cardNumber') cardNumber: string,
  ) {
    try {
      return await this.generateFactProvService.matchCardWithServiceLayer(
        empresa,
        cardNumber,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Error en el endpoint de match de tarjetas.',
        error: error.message,
      };
    }
  }

  @Post('factura-proveedor')
  async generateFacturaProveedor(@Body() request: GenerateFactProvRequestDto) {
    try {
      return await this.generateFactProvService.generateFacturaProveedor(
        request,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Error en el endpoint de generación de factura de proveedor.',
        error: error.message,
      };
    }
  }
}
