import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { format } from 'date-fns';
import { AuthSlService } from '../auth-sl/auth-sl.service';
import { ApiResponse } from '../shared/interfaces/api-response.interface';
import { PrismaClient } from '@prisma/client';

interface SapResponse {
  'odata.metadata': string;
  value: Array<{
    AccountCode: string;
    Sequence: number;
    AccountName: string;
    Reference: string;
    DueDate: string;
    Memo: string;
    DebitAmount: number;
    CreditAmount: number;
    BankMatch: number;
    DataSource: string;
    UserSignature: number;
    ExternalCode: string | null;
    CardCode: string | null;
    CardName: string | null;
    StatementNumber: string | null;
    InvoiceNumber: string;
    PaymentCreated: string;
    VisualOrder: number;
    DocNumberType: string;
    PaymentReference: string | null;
    InvoiceNumberEx: string;
    BICSwiftCode: string | null;
  }>;
}

@Injectable()
export class MovementsService {
  private readonly logger = new Logger(MovementsService.name);
  private readonly empresas = ['ALIANZA', 'FGE', 'MANUFACTURING', 'PRUEBAS'];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authSlService: AuthSlService,
    private readonly prisma: PrismaClient,
  ) {}

  private removeDuplicateMovements(
    movements: SapResponse['value'],
  ): SapResponse['value'] {
    const uniqueMovements = new Map<string, SapResponse['value'][0]>();

    movements.forEach((movement) => {
      // Crear una clave única basada en los campos relevantes
      const key = `${movement.Sequence}-${movement.DueDate}-${movement.DebitAmount}-${movement.CreditAmount}-${movement.Reference}`;

      // Si no existe o si el BankMatch es mayor (más reciente)
      if (
        !uniqueMovements.has(key) ||
        movement.BankMatch > uniqueMovements.get(key)!.BankMatch
      ) {
        uniqueMovements.set(key, movement);
      }
    });

    return Array.from(uniqueMovements.values());
  }

  async findMovementsByDateRange(
    createMovementDto: CreateMovementDto,
  ): Promise<ApiResponse> {
    try {
      const { accountCode, cardNumber, startDate, endDate } = createMovementDto;
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'00:00:00'Z'");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'23:59:59'Z'");

      // Usar accountCode por defecto si está vacío
      const finalAccountCode = accountCode || '1120-015-000';

      const filter = `AccountCode eq '${finalAccountCode}' and Memo eq '${cardNumber}' and DueDate ge '${formattedStartDate}' and DueDate le '${formattedEndDate}'`;
      const baseUrl = this.configService.get<string>('SAP_SL_URL');

      if (!baseUrl) {
        throw new HttpException(
          'SAP_SL_URL no está configurada en el archivo .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}/BankPages?$filter=${filter}&$orderby=DueDate desc`;
      const allMovements: SapResponse['value'] = [];
      const errors: string[] = [];

      for (const empresa of this.empresas) {
        try {
          // Obtener sesión para la empresa
          const authResponse = await this.authSlService.login(empresa);
          if (!authResponse.success) {
            errors.push(
              `Error de autenticación en ${empresa}: ${authResponse.message}`,
            );
            continue;
          }

          const sessionId = authResponse.data.sessionId;
          const agent = new https.Agent({
            rejectUnauthorized: false,
          });

          const response = await firstValueFrom(
            this.httpService.get<SapResponse>(url, {
              httpsAgent: agent,
              headers: {
                'Content-Type': 'application/json',
                Cookie: `B1SESSION=${sessionId}`,
                Accept: 'application/json',
              },
            }),
          );

          if (
            response.data &&
            response.data.value &&
            response.data.value.length > 0
          ) {
            allMovements.push(...response.data.value);
          }
        } catch (error) {
          this.logger.error(
            `Error al buscar movimientos en ${empresa}: ${error.message}`,
          );
          errors.push(`Error en ${empresa}: ${error.message}`);
        }
      }

      // Eliminar duplicados
      let uniqueMovements = this.removeDuplicateMovements(allMovements);

      // Filtrar movimientos ya comprobados
      const comprobados = await this.prisma.movimientosComprobados.findMany();
      uniqueMovements = uniqueMovements.filter((mov) => {
        return !comprobados.some(
          (c) =>
            c.movimientoSequence === String(mov.Sequence) &&
            c.movimientoDueDate.getTime() === new Date(mov.DueDate).getTime() &&
            c.movimientoRef === mov.Reference &&
            c.movimientoAcctName === mov.AccountName &&
            Number(c.movimientoDebAmount) === Number(mov.DebitAmount) &&
            c.movimientoMemo === mov.Memo,
        );
      });

      uniqueMovements.sort(
        (a, b) => new Date(b.DueDate).getTime() - new Date(a.DueDate).getTime(),
      );

      if (uniqueMovements.length === 0) {
        return {
          success: false,
          message: `No se encontraron movimientos para la tarjeta ${cardNumber}`,
          errors: errors.length > 0 ? errors : undefined,
        };
      }

      return {
        success: true,
        message: `Se obtuvieron ${uniqueMovements.length} movimientos de la tarjeta ${cardNumber}`,
        data: {
          'odata.metadata': `${baseUrl}/$metadata#BankPages`,
          value: uniqueMovements,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error general al buscar movimientos: ${error.message}`,
      );
      throw new HttpException(
        {
          success: false,
          message: `Error al buscar movimientos: ${error.message}`,
          errors: [error.message],
        },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  create(createMovementDto: CreateMovementDto) {
    return 'This action adds a new movement';
  }

  findAll() {
    return `This action returns all movements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movement`;
  }

  update(id: number, updateMovementDto: UpdateMovementDto) {
    return `This action updates a #${id} movement`;
  }

  remove(id: number) {
    return `This action removes a #${id} movement`;
  }
}
