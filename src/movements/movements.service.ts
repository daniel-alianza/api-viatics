import { Injectable } from '@nestjs/common';
import { QueryMovementsHelper } from '../helpers/query-movements';
import { ApiResponse, MovementResult } from '../interfaces/database.interface';

@Injectable()
export class MovementsService {
  constructor(private readonly queryMovementsHelper: QueryMovementsHelper) {}

  async getMovementsByCard(
    cardNumber: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<MovementResult>> {
    return await this.queryMovementsHelper.getMovementsByCard(
      cardNumber,
      startDate,
      endDate,
    );
  }
}
