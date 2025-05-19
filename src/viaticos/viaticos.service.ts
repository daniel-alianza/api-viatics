import { Injectable } from '@nestjs/common';
import { QuerySolideviaticosHelper } from '../helpers/query-solideviaticos';
import { ApiResponse, Viatico } from '../interfaces/database.interface';

@Injectable()
export class ViaticosService {
  constructor(
    private readonly querySolideviaticosHelper: QuerySolideviaticosHelper,
  ) {}

  async getViaticoPorEmail(
    email: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<Viatico[]>> {
    const result = await this.querySolideviaticosHelper.getViaticoPorEmail(
      email,
      page,
      limit,
    );
    return result;
  }
}
