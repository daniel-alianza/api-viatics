import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse, MovementResult } from '../interfaces/database.interface';

@Injectable()
export class QueryMovementsHelper {
  constructor(
    @Inject('DB_ALIANZA_DATASOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async getMovementsByCard(
    cardNumber: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<MovementResult>> {
    try {
      const result = await this.dataSource.query<MovementResult[]>(
        `
        SELECT 
          (SELECT COUNT(*) 
           FROM OBNK 
           WHERE DueDate >= @0 
             AND DueDate <= @1 
             AND Memo2 = @2
          ) AS TotalExtractos,

          (SELECT COUNT(*) 
           FROM OBNK OBNK
           LEFT JOIN Intranet.dbo.ComprobacionesViat CV 
             ON OBNK.Sequence = CV.Sequencee 
             AND OBNK.DueDate = CV.DueDate 
             AND OBNK.Ref = CV.Refs 
             AND OBNK.AcctName = CV.AcctName 
             AND OBNK.DebAmount = CV.DebitAmount 
             AND OBNK.Memo = CV.Memo 
             AND CV.Estado IN ('pendiente', 'revisado', 'autorizado')
           WHERE OBNK.DueDate >= @0 
             AND OBNK.DueDate <= @1 
             AND OBNK.Memo2 = @2
             AND (CV.Sequencee IS NULL OR CV.Estado = 'rechazado')
          ) AS TotalComprobacionesFaltantes,

          (SELECT COUNT(DISTINCT CV.Sequencee) 
           FROM Intranet.dbo.ComprobacionesViat CV 
           WHERE CV.DueDate >= @0 
             AND CV.DueDate <= @1 
             AND CV.Estado IN ('revisado', 'autorizado') 
             AND CV.Sequencee IN (
               SELECT OBNK.Sequence 
               FROM OBNK OBNK 
               WHERE OBNK.Memo2 = @2 
                 AND OBNK.DueDate >= @0 
                 AND OBNK.DueDate <= @1
             )
          ) AS TotalComprobacionesRealizadas,

          (CASE 
             WHEN DATEDIFF(DAY, GETDATE(), @1) < 0 THEN 0 
             ELSE DATEDIFF(DAY, GETDATE(), @1) 
           END
          ) AS DiasRestantesParaComprobar
      `,
        [startDate, endDate, cardNumber],
      );

      return {
        status: 'success' as const,
        message: 'Información de movimientos obtenida correctamente',
        data: result[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error' as const,
        message: 'Error al obtener la información de movimientos',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
