import { Controller, Get, Query, Param } from '@nestjs/common';
import { ChecksService } from './checks.service';
import { GetMovementsDto } from './dto/get-movements.dto';
import { ApiResponse } from './interfaces/movement.interface';

@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Get('movements')
  async getMovements(
    @Query() query: GetMovementsDto,
  ): Promise<ApiResponse<any>> {
    return await this.checksService.getMovements(query);
  }

  @Get('movements/:ref')
  async getMovementByReference(
    @Param('ref') ref: string,
  ): Promise<ApiResponse<any>> {
    return await this.checksService.getMovementByReference(ref);
  }
}
