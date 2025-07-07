import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthSlService } from '../auth-sl/auth-sl.service';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import {
  TaxCodeResponse,
  SimplifiedTaxCode,
} from './interfaces/taxcode.interface';
import { SessionResponse } from '../wholesale-accounts/interfaces/SessionResponse.Interface';

@Injectable()
export class SalesTaxcodeService {
  private readonly logger = new Logger(SalesTaxcodeService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authSlService: AuthSlService,
  ) {}

  async getTaxCodes(empresa: string): Promise<SimplifiedTaxCode[]> {
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
      const url = `${baseUrl}/SalesTaxCodes`;

      const { data } = await firstValueFrom(
        this.httpService.get<TaxCodeResponse>(url, {
          httpsAgent: agent,
          headers: {
            'Content-Type': 'application/json',
            Cookie: `B1SESSION=${session.data.sessionId}`,
            Accept: 'application/json',
          },
        }),
      );

      // Filtrar solo los campos Name y Code
      const simplifiedData = data.value.map(({ Name, Code }) => ({
        Name,
        Code,
      }));

      return simplifiedData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Error al obtener códigos de impuestos: ${errorMessage}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error al consultar los códigos de impuestos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
