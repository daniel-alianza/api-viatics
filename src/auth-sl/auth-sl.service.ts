import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import { ApiResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthSlService {
  private readonly logger = new Logger(AuthSlService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async login(empresa: string): Promise<ApiResponse> {
    try {
      const empresaUpper = empresa.toUpperCase();
      const baseUrl = this.configService.get<string>('SAP_SL_URL');

      if (!baseUrl) {
        throw new HttpException(
          'SAP_SL_URL no está configurada en el archivo .env',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const dbName = this.getDbNameByEmpresa(empresaUpper);
      this.logger.debug(
        `Intentando login para ${empresa} en URL: ${baseUrl} con DB: ${dbName}`,
      );

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const credentials = {
        CompanyDB: dbName,
        UserName: this.configService.get<string>('SAP_USERNAME'),
        Password: this.configService.get<string>('SAP_PASSWORD'),
      };

      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/Login`, credentials, {
          httpsAgent: agent,
        }),
      );

      return {
        success: true,
        message: 'Se inició sesión exitosamente',
        data: {
          empresa: empresa,
          baseDatos: dbName,
          sessionId: response.data?.SessionId,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error en la autenticación para ${empresa}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: `Error en la autenticación para ${empresa}: ${error.message}`,
          error: error.response?.data || 'Error desconocido',
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getDbNameByEmpresa(empresa: string): string {
    const normalized = empresa.toUpperCase().trim();

    // Mapear nombres flexibles a los nombres clave existentes
    const nombreBase = (() => {
      if (normalized.includes('ALIANZA')) return 'ALIANZA';
      if (normalized.includes('FG') && normalized.includes('ELECTRICAL'))
        return 'FGE';
      if (normalized.includes('FG') && normalized.includes('MANUFACTURING'))
        return 'MANUFACTURING';
      if (
        normalized.includes('TABLEROS') ||
        normalized.includes('ARRANCADORES')
      )
        return 'FGE';
      if (normalized.includes('PRUEBA')) return 'PRUEBAS';
      return normalized;
    })();

    const dbName = this.configService.get<string>(
      `SAP_DB_${
        nombreBase === 'ALIANZA'
          ? 'AE'
          : nombreBase === 'FGE'
            ? 'FG'
            : nombreBase === 'MANUFACTURING'
              ? 'FGM'
              : nombreBase === 'PRUEBAS'
                ? 'TEST'
                : ''
      }`,
    );

    if (!dbName) {
      throw new HttpException(
        `Base de datos no configurada para la empresa ${empresa}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return dbName;
  }
}
