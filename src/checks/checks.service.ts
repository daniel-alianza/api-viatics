import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Movement, ApiResponse } from './interfaces/movement.interface';
import { GetMovementsDto } from './dto/get-movements.dto';

@Injectable()
export class ChecksService {
  constructor(
    @Inject('DB_ALIANZA_DATASOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async getMovements(
    filtro: GetMovementsDto,
  ): Promise<ApiResponse<Movement[]>> {
    try {
      // Limpiar el número de tarjeta
      const cleanCardNumber = filtro.cardNumber.replace(/-/g, '');

      // Construir la consulta base
      let query = `
        SELECT 
          Sequence, 
          DueDate, 
          Memo, 
          DebAmount, 
          AcctName, 
          Ref
        FROM OBNK
        WHERE Memo = @0
          AND DueDate >= @1
          AND DueDate <= @2
      `;
      const params = [cleanCardNumber, filtro.startDate, filtro.endDate];

      // Agregar filtro por referencia si existe
      if (filtro.ref) {
        query += ` AND Ref = @${params.length}`;
        params.push(filtro.ref);
      }

      query += ` ORDER BY DueDate DESC`;

      const result = await this.dataSource.query<Movement[]>(query, params);

      return {
        status: 'success',
        message: `Movimientos encontrados: ${result.length}`,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al obtener los movimientos',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMovementByReference(ref: string): Promise<ApiResponse<Movement>> {
    try {
      const result = await this.dataSource.query<Movement[]>(
        `
        SELECT 
          Sequence, 
          DueDate, 
          Memo, 
          DebAmount, 
          AcctName, 
          Ref
        FROM OBNK
        WHERE Ref = @0
        `,
        [ref],
      );

      if (!result || result.length === 0) {
        return {
          status: 'error',
          message: `No se encontró ningún movimiento con la referencia ${ref}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'success',
        message: 'Movimiento encontrado correctamente',
        data: result[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al buscar el movimiento',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
