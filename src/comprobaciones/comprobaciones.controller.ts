import { Controller, Get, Query } from '@nestjs/common';
import { ComprobacionesService } from './comprobaciones.service';

@Controller('comprobaciones')
export class ComprobacionesController {
  constructor(private readonly comprobacionesService: ComprobacionesService) {}

  @Get()
  async getAllComprobaciones(@Query('usuario') usuario?: string) {
    return await this.comprobacionesService.getAllComprobaciones();
  }
}
