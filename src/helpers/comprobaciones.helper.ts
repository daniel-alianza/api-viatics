import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse, Viatico } from '../interfaces/database.interface';

@Injectable()
export class ComprobacionesHelper {
  constructor(
    @Inject('DB_INTRANT_DATASOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async getAllComprobaciones(): Promise<ApiResponse<Viatico[]>> {
    try {
      const result = await this.dataSource.query<Viatico[]>(
        'SELECT * FROM dbo.VIAT;',
      );

      return {
        status: 'success' as const,
        message: 'Comprobaciones obtenidas correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error' as const,
        message: 'Error al obtener las comprobaciones',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // async getComprobacionesPorCorreo(usuario: string): Promise<ApiResponse<Viatico[]>> {
  //   try {
  //     const result = await this.dataSource.query<Viatico[]>(
  //       'SELECT * FROM ComprobacionesViat WHERE Usuario = @0 ORDER BY Fecha DESC;',
  //       [usuario]
  //     );

  //     return {
  //       status: 'success' as const,
  //       message: 'Comprobaciones filtradas por usuario obtenidas correctamente',
  //       data: result,
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Error desconocido';
  //     return {
  //       status: 'error' as const,
  //       message: 'Error al obtener las comprobaciones por usuario',
  //       error: errorMessage,
  //       timestamp: new Date().toISOString(),
  //     };
  //   }
  // }
}
