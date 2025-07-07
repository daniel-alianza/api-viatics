import { Injectable } from '@nestjs/common';
import { AuthSlService } from '../../auth-sl/auth-sl.service';
import { UsersService } from '../../users/users.service';
import { CardMatchResult } from '../interfaces/fact-prov.interface';

@Injectable()
export class CardMatchService {
  constructor(
    private readonly authSlService: AuthSlService,
    private readonly usersService: UsersService,
  ) {}

  async matchCardWithServiceLayer(
    empresa: string,
    cardNumber: string,
  ): Promise<CardMatchResult> {
    try {
      // Buscar la tarjeta localmente
      const card = await this.usersService['prisma'].card.findUnique({
        where: { cardNumber },
      });

      if (!card) {
        return {
          success: false,
          message: 'La tarjeta no existe localmente.',
        };
      }

      // Login a Service Layer
      const loginResponse = await this.authSlService.login(empresa);
      if (!loginResponse.success) {
        return {
          success: false,
          message: 'No se pudo iniciar sesión en Service Layer.',
        };
      }

      const sessionId = loginResponse.data.sessionId;
      const baseUrl =
        this.authSlService['configService'].get<string>('SAP_SL_URL');
      const https = require('https');
      const axios = require('axios');
      const agent = new https.Agent({ rejectUnauthorized: false });

      // Buscar la tarjeta en Service Layer usando filtro exacto en CardForeignName
      const url = `${baseUrl}/BusinessPartners?$filter=startswith(CardCode,'PRT') and CardForeignName eq '${cardNumber}'&$select=CardCode,CardName,CardForeignName`;
      const response = await axios.get(url, {
        httpsAgent: agent,
        headers: { Cookie: `B1SESSION=${sessionId}` },
      });

      const partners = response.data.value;
      if (partners && partners.length > 0) {
        return {
          success: true,
          message: 'Las tarjetas coinciden.',
          data: partners[0],
        };
      } else {
        return {
          success: false,
          message: 'Las tarjetas no coinciden.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al realizar el match de tarjetas.',
        error: error.message,
      };
    }
  }
}
