import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse } from '../interfaces/database.interface';

export interface Movimiento {
  Sequence: number;
  DueDate: Date;
  Memo: string;
  DebAmount: number;
  AcctName: string;
  Ref: string;
}

@Injectable()
export class QueryMovimientosHelper {
  constructor(
    @Inject('DB_ALIANZA_DATASOURCE')
    private readonly dataSource: DataSource,
    @Inject('DB_INTRANT_DATASOURCE')
    private readonly dataSourceIntranet: DataSource,
  ) {}

  async getMovimientosByViatico(
    idViatico: string,
  ): Promise<ApiResponse<Movimiento[]>> {
    try {
      // Buscar el viático
      const viaticoResult = await this.dataSourceIntranet.query(
        'SELECT * FROM dbo.VIAT WHERE IdViaticos = @0',
        [idViatico],
      );

      if (!viaticoResult || viaticoResult.length === 0) {
        return {
          status: 'error' as const,
          message: 'El viático no existe',
          error: 'Viático no encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      // Obtener el número de tarjeta y limpiar guiones
      const numTarjeta = (viaticoResult[0].NumTarjeta || '').replace(/-/g, '');
      const fechaSalida = viaticoResult[0].FechaSalida;
      const fechaRegreso = viaticoResult[0].FechaRegreso;

      if (!numTarjeta) {
        return {
          status: 'error' as const,
          message: 'El viático no tiene número de tarjeta asociado',
          error: 'Sin número de tarjeta',
          timestamp: new Date().toISOString(),
        };
      }
      if (!fechaSalida || !fechaRegreso) {
        return {
          status: 'error' as const,
          message: 'El viático no tiene fechas de salida o regreso',
          error: 'Sin fechas de salida o regreso',
          timestamp: new Date().toISOString(),
        };
      }

      // Ajustar el rango de fechas para incluir siete días antes y siete días después
      const fechaSalidaAjustada = new Date(fechaSalida);
      fechaSalidaAjustada.setDate(fechaSalidaAjustada.getDate() - 7);
      const fechaRegresoAjustada = new Date(fechaRegreso);
      fechaRegresoAjustada.setDate(fechaRegresoAjustada.getDate() + 7);

      // Buscar movimientos por número de tarjeta y rango de fechas ajustado
      const result = await this.dataSource.query<Movimiento[]>(
        `
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
        ORDER BY DueDate DESC
        `,
        [numTarjeta, fechaSalidaAjustada, fechaRegresoAjustada],
      );

      return {
        status: 'success' as const,
        message: `Movimientos obtenidos correctamente. Total: ${result.length}`,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error' as const,
        message: 'Error al obtener los movimientos',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
