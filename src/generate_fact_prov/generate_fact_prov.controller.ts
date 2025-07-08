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
import { TicketContabilidadService } from './services/ticket-contabilidad.service';

@Controller('generate-fact-prov')
@UsePipes(new ValidationPipe({ transform: true }))
export class GenerateFactProvController {
  constructor(
    private readonly generateFactProvService: GenerateFactProvService,
    private readonly ticketContabilidadService: TicketContabilidadService,
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

  @Post('authorize-ticket')
  async authorizeTicket(
    @Body()
    body: {
      comprobacionId: number;
      approverId: number;
      comment?: string;
    },
  ) {
    return this.ticketContabilidadService.authorizeTicket(
      body.comprobacionId,
      body.approverId,
      body.comment,
    );
  }

  @Post('ticket-to-factura-proveedor')
  async ticketToFacturaProveedor(@Body() body: any) {
    return this.ticketContabilidadService.processTicketToFacturaProveedor(body);
  }
}
