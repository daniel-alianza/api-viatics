import { Injectable } from '@nestjs/common';
import { AuthSlService } from '../../auth-sl/auth-sl.service';
import { PrismaClient } from '@prisma/client';
import {
  ServiceLayerInvoiceData,
  InvoiceGenerationResult,
} from '../interfaces/fact-prov.interface';

@Injectable()
export class ServiceLayerInvoiceService {
  constructor(
    private readonly authSlService: AuthSlService,
    private readonly prisma: PrismaClient,
  ) {}

  async createInvoice(
    empresa: string,
    invoiceData: ServiceLayerInvoiceData,
    comprobacionId?: number,
    approverId?: number,
  ): Promise<InvoiceGenerationResult> {
    try {
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

      // Crear la factura en Service Layer
      console.log('Enviando datos a Service Layer:', {
        empresa,
        cardCode: invoiceData.CardCode,
        payload: JSON.stringify(invoiceData, null, 2),
      });

      const response = await axios.post(
        `${baseUrl}/PurchaseInvoices`,
        invoiceData,
        {
          httpsAgent: agent,
          headers: {
            Cookie: `B1SESSION=${sessionId}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Debug: Mostrar el DocEntry de la factura creada
      console.log('Factura creada exitosamente en Service Layer:', {
        empresa,
        cardCode: invoiceData.CardCode,
        docEntry: response.data.DocEntry,
        docTotal: invoiceData.DocTotal,
        docDate: invoiceData.DocDate,
        comments: invoiceData.Comments,
        timestamp: new Date().toISOString(),
      });

      // ACTUALIZAR TABLA SAP_STATUS SI SE PROPORCIONA COMPROBACION_ID
      if (comprobacionId && approverId) {
        try {
          await this.prisma.sapStatus.upsert({
            where: { comprobacionId },
            update: {
              isSentToSap: true,
              sapDocEntry: String(response.data.DocEntry),
              sentAt: new Date(),
              sentBy: approverId,
              sapResponse: JSON.stringify(response.data),
              errorMessage: null,
            },
            create: {
              comprobacionId,
              isSentToSap: true,
              sapDocEntry: String(response.data.DocEntry),
              sentAt: new Date(),
              sentBy: approverId,
              sapResponse: JSON.stringify(response.data),
            },
          });
          console.log(
            `SapStatus actualizado para comprobación ${comprobacionId} - DocEntry: ${response.data.DocEntry}`,
          );
        } catch (statusError) {
          console.error('Error al actualizar SapStatus:', statusError);
          // No fallar el proceso principal si falla la actualización de SapStatus
        }
      }

      return {
        success: true,
        message: 'Factura creada exitosamente en Service Layer.',
        invoiceId: response.data.DocEntry,
      };
    } catch (error) {
      console.error('Error al crear la factura en Service Layer:', {
        error: error.message,
        stack: error.stack,
        empresa: empresa,
        cardCode: invoiceData.CardCode,
        docTotal: invoiceData.DocTotal,
        docDate: invoiceData.DocDate,
        comments: invoiceData.Comments,
        documentLinesCount: invoiceData.DocumentLines?.length || 0,
        serviceLayerResponse: error.response?.data,
        serviceLayerStatus: error.response?.status,
        serviceLayerErrorMessage: error.response?.data?.error?.message,
        serviceLayerErrorCode: error.response?.data?.error?.code,
        fullServiceLayerError: JSON.stringify(error.response?.data, null, 2),
        timestamp: new Date().toISOString(),
      });
      // REGISTRAR ERROR EN SAP_STATUS SI SE PROPORCIONA COMPROBACION_ID
      if (comprobacionId && approverId) {
        try {
          await this.prisma.sapStatus.upsert({
            where: { comprobacionId },
            update: {
              isSentToSap: false,
              errorMessage:
                error.response?.data?.error?.message || error.message,
              sentAt: new Date(),
              sentBy: approverId,
              sapResponse: JSON.stringify(error.response?.data || {}),
            },
            create: {
              comprobacionId,
              isSentToSap: false,
              errorMessage:
                error.response?.data?.error?.message || error.message,
              sentAt: new Date(),
              sentBy: approverId,
              sapResponse: JSON.stringify(error.response?.data || {}),
            },
          });
          console.log(
            `Error registrado en SapStatus para comprobación ${comprobacionId}`,
          );
        } catch (statusError) {
          console.error('Error al registrar error en SapStatus:', statusError);
        }
      }

      return {
        success: false,
        message: 'Error al crear la factura en Service Layer.',
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
