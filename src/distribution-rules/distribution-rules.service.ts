import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthSlService } from '../auth-sl/auth-sl.service';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { DistributionRulesResponse } from './interfaces/distribution-rules.interface';
import { SessionResponse } from '../wholesale-accounts/interfaces/SessionResponse.Interface';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Injectable()
export class DistributionRulesService {
  private readonly logger = new Logger(DistributionRulesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authSlService: AuthSlService,
  ) {}

  async getFactorDescriptions(
    empresa: string,
  ): Promise<ServiceResponse<string[]>> {
    try {
      const authResponse = (await this.authSlService.login(
        empresa,
      )) as SessionResponse;
      if (!authResponse.success) {
        throw new HttpException(
          `Error de autenticación en ${empresa}: ${authResponse.message}`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const baseUrl = this.configService.get<string>('SAP_SL_URL');
      if (!baseUrl) {
        throw new HttpException(
          'SAP_SL_URL no está configurada en el archivo .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const targetNames = [
        'Corporativo',
        'DF CENTRO VENTAS',
        'DF OPERACIONES',
        'DF VENTAS',
        'LEON ADMON',
        'LEON OPERACIONES',
        'LEON VENTAS',
        'MARKETING',
        'MONTERREY ADMON',
        'MONTERREY OPERACIONES',
        'MONTERREY VENTAS',
        'PUEBLA OPERACIONES',
        'PUEBLA VENTAS',
        'QUERETARO ADMON',
        'QUERETARO OPERACIONES',
        'QUERETARO VENTAS',
        'SAN LUIS POTOSI ADMON',
        'SAN LUIS POTOSI OPERACIONES',
        'SAN LUIS POTOSI VENTAS',
      ];

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const headers = {
        'Content-Type': 'application/json',
        Cookie: `B1SESSION=${authResponse.data.sessionId}`,
        Accept: 'application/json',
      };

      const batchSize = 20;
      let skip = 0;
      const results: string[] = [];

      while (true) {
        const url = `${baseUrl}/DistributionRules?$select=FactorDescription&$orderby=FactorDescription asc&$top=${batchSize}&$skip=${skip}`;
        const response = await firstValueFrom(
          this.httpService.get<DistributionRulesResponse>(url, {
            httpsAgent: agent,
            headers,
          }),
        );

        if (!response.data?.value || response.data.value.length === 0) {
          break;
        }

        const filteredBatch = response.data.value
          .map((rule) => rule.FactorDescription)
          .filter(
            (desc): desc is string => !!desc && targetNames.includes(desc),
          )
          .map((desc) => desc.replace(/DF/g, 'Atizapan'));

        results.push(...filteredBatch);

        skip += batchSize;
        if (response.data.value.length < batchSize) {
          break;
        }
      }

      const sortedResults = results.sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' }),
      );

      return {
        success: true,
        message: 'Operación exitosa',
        data: sortedResults,
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

      this.logger.error(
        `Error al obtener reglas de distribución en ${empresa}: ${errorMessage}`,
        errorDetails,
      );

      throw new HttpException(
        {
          success: false,
          message: `Error al obtener reglas de distribución: ${errorMessage}`,
          error: errorDetails,
        },
        errorStatus,
      );
    }
  }
}
