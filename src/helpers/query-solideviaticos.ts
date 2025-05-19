import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse, Viatico } from '../interfaces/database.interface';

@Injectable()
export class QuerySolideviaticosHelper {
  constructor(
    @Inject('DB_INTRANT_DATASOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async getViaticoPorEmail(
    email: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<Viatico[]>> {
    try {
      // Asegurarnos de que page y limit sean números enteros
      const pageNumber = Math.max(1, Math.floor(page));
      const limitNumber = Math.max(1, Math.floor(limit));
      const offset = (pageNumber - 1) * limitNumber;

      const result = await this.dataSource.query<Viatico[]>(
        `
        SELECT *
        FROM dbo.VIAT 
        WHERE email = @0
        ORDER BY FechaSolicitud DESC
        OFFSET @1 ROWS
        FETCH NEXT @2 ROWS ONLY;
      `,
        [email, offset, limitNumber],
      );

      // Obtener el total de registros
      const totalResult = await this.dataSource.query<{ total: number }[]>(
        'SELECT COUNT(*) as total FROM dbo.VIAT WHERE email = @0',
        [email],
      );

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limitNumber);

      return {
        status: 'success' as const,
        message: 'Viáticos obtenidos correctamente',
        data: result,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error' as const,
        message: 'Error al obtener los viáticos',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
