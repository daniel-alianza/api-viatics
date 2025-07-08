import { Injectable } from '@nestjs/common';
import { CardMatchService } from './services/card-match.service';
import { InvoiceTransformerService } from './services/invoice-transformer.service';
import { ServiceLayerInvoiceService } from './services/service-layer-invoice.service';
import { GenerateFactProvRequestDto } from './dto/generate-fact-prov.dto';
import { FactProvResponse } from './interfaces/fact-prov.interface';
import { WholesaleAccountsService } from '../wholesale-accounts/wholesale-accounts.service';
import { SalesTaxcodeService } from '../sales-taxcode/sales-taxcode.service';

@Injectable()
export class GenerateFactProvService {
  constructor(
    private readonly cardMatchService: CardMatchService,
    private readonly invoiceTransformerService: InvoiceTransformerService,
    private readonly serviceLayerInvoiceService: ServiceLayerInvoiceService,
    private readonly wholesaleAccountsService: WholesaleAccountsService,
    private readonly salesTaxcodeService: SalesTaxcodeService,
  ) {}

  async matchCardWithServiceLayer(empresa: string, cardNumber: string) {
    return await this.cardMatchService.matchCardWithServiceLayer(
      empresa,
      cardNumber,
    );
  }

  private async mapAccountNameToCode(
    accountName: string,
    empresa: string,
  ): Promise<string | null> {
    const response = await this.wholesaleAccountsService.findAccountsByCode(
      '',
      empresa,
    );
    if (!response.data) return null;
    const match = response.data.find((acc) => acc.Name === accountName);
    return match ? match.Code : null;
  }

  private async mapTaxNameToCode(
    taxName: string,
    empresa: string,
  ): Promise<string | null> {
    const result = await this.salesTaxcodeService.getTaxCodes(empresa);
    const match = result.find((tax) => tax.Name === taxName);
    return match ? match.Code : null;
  }

  async generateFacturaProveedor(
    request: GenerateFactProvRequestDto,
  ): Promise<FactProvResponse> {
    try {
      // Validar que NO sea un vale/ticket
      if (
        request.xmlData?.Comprobante?.TipoDeComprobante?.toLowerCase() ===
          'vale' ||
        request.xmlData?.Comprobante?.TipoDeComprobante?.toLowerCase() ===
          'ticket'
      ) {
        return {
          success: false,
          message: 'No se permite procesar vales o tickets en este servicio.',
          error: 'Tipo de comprobante no permitido',
        };
      }

      // 1. Validar que las tarjetas coincidan
      const cardMatchResult =
        await this.cardMatchService.matchCardWithServiceLayer(
          request.empresa,
          request.cardNumber,
        );

      if (!cardMatchResult.success || !cardMatchResult.data) {
        return {
          success: false,
          message: cardMatchResult.message,
          error: cardMatchResult.error,
        };
      }

      // 2. Mapear name a code para account y tax code
      const accountCode = request.accountName
        ? await this.mapAccountNameToCode(request.accountName, request.empresa)
        : request.accountCode;
      const taxCode = request.taxName
        ? await this.mapTaxNameToCode(request.taxName, request.empresa)
        : request.taxCode;

      if (!accountCode || !taxCode) {
        return {
          success: false,
          message:
            'Los campos accountCode y taxCode son obligatorios para crear la factura.',
          error: 'Campos requeridos faltantes',
        };
      }

      // 3. Transformar los datos del XML a la estructura de Service Layer
      const serviceLayerData =
        this.invoiceTransformerService.transformXmlToServiceLayer(
          request.xmlData,
          cardMatchResult.data.CardCode,
          request.comments,
          accountCode,
          taxCode,
        );

      // 4. Crear la factura en Service Layer
      const invoiceResult = await this.serviceLayerInvoiceService.createInvoice(
        request.empresa,
        serviceLayerData,
      );

      if (!invoiceResult.success) {
        return {
          success: false,
          message: invoiceResult.message,
          error: invoiceResult.error,
        };
      }

      return {
        success: true,
        message: 'Factura de proveedor generada exitosamente.',
        data: {
          invoiceId: invoiceResult.invoiceId,
          cardMatch: cardMatchResult.data,
          xmlData: {
            folio: request.xmlData.Comprobante.Folio,
            serie: request.xmlData.Comprobante.Serie,
            total: request.xmlData.Comprobante.Total,
          },
        },
      };
    } catch (error) {
      console.error('Error inesperado al generar la factura de proveedor:', {
        error: error.message,
        stack: error.stack,
        empresa: request.empresa,
        cardNumber: request.cardNumber,
        folio: request.xmlData?.Comprobante?.Folio,
        serie: request.xmlData?.Comprobante?.Serie,
        total: request.xmlData?.Comprobante?.Total,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: 'Error inesperado al generar la factura de proveedor.',
        error: error.message,
      };
    }
  }
}
