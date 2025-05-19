import { Injectable } from '@nestjs/common';
import { ComprobacionesHelper } from '../helpers/comprobaciones.helper';
import { ApiResponse, Viatico } from '../interfaces/database.interface';

@Injectable()
export class ComprobacionesService {
  constructor(private readonly comprobacionesHelper: ComprobacionesHelper) {}

  async getAllComprobaciones(): Promise<ApiResponse<Viatico[]>> {
    return await this.comprobacionesHelper.getAllComprobaciones();
  }

  // async getComprobacionesPorCorreo(correo: string): Promise<ApiResponse<Viatico[]>> {
  //   return await this.comprobacionesHelper.getComprobacionesPorCorreo(correo);
  // }
}
