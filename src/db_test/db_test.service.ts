import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ApiResponse,
  ComprobacionViat,
} from '../interfaces/database.interface';

@Injectable()
export class DbTestService {
  constructor(
    @Inject('DB_INTRANT_DATASOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async testConnection(): Promise<ApiResponse<ComprobacionViat[]>> {
    try {
      const result = await this.dataSource.query<ComprobacionViat[]>(
        'SELECT TOP 5 * FROM dbo.ComprobacionesViat ORDER BY Fecha DESC;',
      );

      return {
        status: 'success',
        message: 'Conexión a SQL Server establecida correctamente',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error',
        message: 'Error al conectar con SQL Server',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
