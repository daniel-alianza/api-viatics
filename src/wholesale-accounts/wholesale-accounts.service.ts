import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthSlService } from 'src/auth-sl/auth-sl.service';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { AccountResponse } from './dto/search-accounts.dto';
import { SessionResponse } from './interfaces/SessionResponse.Interface';
import { ApiResponse } from './interfaces/ApiResp.Interface';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Injectable()
export class WholesaleAccountsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authSlService: AuthSlService,
  ) {}

  async findAccountsByCode(
    code: string,
    empresa: string,
  ): Promise<ServiceResponse<AccountResponse[]>> {
    try {
      const session = (await this.authSlService.login(
        empresa,
      )) as SessionResponse;

      if (!session?.data?.sessionId) {
        throw new HttpException(
          'Error de autenticación',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const baseUrl = this.configService.get<string>('SAP_SL_URL');
      if (!baseUrl) {
        throw new HttpException(
          'URL de SAP no configurada',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const agent = new https.Agent({ rejectUnauthorized: false });

      const allowedNames = [
        'ALIMENTACIÓN',
        'ARTICULOS PARA EMPAQUE',
        'AUTOBUS',
        'AVION',
        'BBVA QUERETARO 5865',
        'CASETAS',
        'COMBUSTIBLES Y LUBRICANTES',
        'COMISIONES Y CARGOS BANCARIOS',
        'DESPENSA',
        'DIVERSOS',
        'ENVIOS Y MENSAJERIA',
        'FLETES',
        'HERRAMIENTAS Y EQUIPO',
        'HOSPEDAJE',
        'IVA POR ACREDITAR PAGADO',
        'MONEDERO EFECTIVALE VIATICOS',
        'MTTO. EQUIPO DE TRANSPORTE',
        'NO DEDUCIBLES',
        'OTROS IMPTOS Y DERECHOS',
        'PAPELERIA',
        'TAXIS',
      ];

      const normalize = (str: string) => str.trim().toUpperCase();
      const allowedNamesNormalized = allowedNames.map(normalize);

      const foundAccounts: AccountResponse[] = [];
      const foundNames = new Set<string>();
      let skip = 0;
      const top = 20;
      let hasMoreData = true;
      const maxIterations = 1000;
      let iterations = 0;

      while (
        hasMoreData &&
        foundNames.size < allowedNames.length &&
        iterations < maxIterations
      ) {
        const filter = `$filter=startswith(Code,'${code}')`;
        const pagination = `$top=${top}&$skip=${skip}`;
        const url = `${baseUrl}/ChartOfAccounts?${filter}&$orderby=Name asc&${pagination}`;

        const { data } = await firstValueFrom(
          this.httpService.get<ApiResponse<AccountResponse>>(url, {
            httpsAgent: agent,
            headers: {
              Cookie: `B1SESSION=${session.data.sessionId}`,
            },
          }),
        );

        if (!data.value || data.value.length === 0) {
          hasMoreData = false;
          break;
        }

        data.value.forEach((account) => {
          const normalizedName = normalize(account.Name);
          const idx = allowedNamesNormalized.indexOf(normalizedName);
          if (idx !== -1 && !foundNames.has(normalizedName)) {
            foundAccounts.push(account);
            foundNames.add(normalizedName);
          }
        });

        if (foundNames.size === allowedNames.length) {
          break;
        }

        if (data.value.length < top) {
          hasMoreData = false;
        }

        skip += top;
        iterations++;
      }

      // 🔍 Búsqueda adicional solo para BBVA si no fue encontrado
      const bbvaName = normalize('BBVA QUERETARO 5865');
      if (!foundNames.has(bbvaName)) {
        const specialFilter = `$filter=Code eq '1120-003-000'`;
        const specialUrl = `${baseUrl}/ChartOfAccounts?${specialFilter}`;

        const { data: specialData } = await firstValueFrom(
          this.httpService.get<ApiResponse<AccountResponse>>(specialUrl, {
            httpsAgent: agent,
            headers: {
              Cookie: `B1SESSION=${session.data.sessionId}`,
            },
          }),
        );

        if (
          specialData.value &&
          specialData.value.length > 0 &&
          normalize(specialData.value[0].Name) === bbvaName
        ) {
          foundAccounts.push(specialData.value[0]);
          foundNames.add(bbvaName);
        }
      }

      return {
        success: true,
        message: 'Operación exitosa',
        data: foundAccounts,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const errorDetails = {
        code: errorStatus,
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
        line: error instanceof Error ? error.stack?.split('\n')[1] : undefined,
      };

      throw new HttpException(
        {
          success: false,
          message: `Error al buscar cuentas: ${errorMessage}`,
          error: errorDetails,
        },
        errorStatus,
      );
    }
  }
}
