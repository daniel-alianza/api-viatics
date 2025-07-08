import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ComprobacionStatus } from '../../comprobaciones/dto/update-status.dto';
import { CardMatchService } from './card-match.service';
import { WholesaleAccountsService } from '../../wholesale-accounts/wholesale-accounts.service';
import { SalesTaxcodeService } from '../../sales-taxcode/sales-taxcode.service';
import { DistributionRulesService } from '../../distribution-rules/distribution-rules.service';
import { ServiceLayerInvoiceService } from './service-layer-invoice.service';
import {
  ServiceLayerInvoiceData,
  FactProvResponse,
} from '../interfaces/fact-prov.interface';

@Injectable()
export class TicketContabilidadService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cardMatchService: CardMatchService,
    private readonly wholesaleAccountsService: WholesaleAccountsService,
    private readonly salesTaxcodeService: SalesTaxcodeService,
    private readonly distributionRulesService: DistributionRulesService,
    private readonly serviceLayerInvoiceService: ServiceLayerInvoiceService,
  ) {}

  async authorizeTicket(
    comprobacionId: number,
    approverId: number,
    comment?: string,
  ) {
    // Buscar la comprobación
    const comprobacion = await this.prisma.comprobacion.findUnique({
      where: { id: comprobacionId },
    });
    if (!comprobacion) {
      throw new NotFoundException(
        `Comprobación con ID ${comprobacionId} no encontrada`,
      );
    }
    if (comprobacion.comprobanteType !== 'ticket') {
      throw new BadRequestException(
        'Solo se pueden autorizar comprobaciones de tipo ticket',
      );
    }
    // Cambiar el status a autorizada_contabilidad
    const updated = await this.prisma.comprobacion.update({
      where: { id: comprobacionId },
      data: {
        status: 'autorizada_contabilidad',
        approverId,
        approverComment: comment,
      },
    });
    return {
      status: 'success',
      message: 'Ticket autorizado por contabilidad',
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }

  async processTicketToFacturaProveedor({
    empresa,
    cardNumber,
    category,
    taxIndicator,
    distributionRule,
    responsable,
    motivo,
    descripcion,
    importe,
    comment,
    comprobacionId,
    approverId,
    accountCode,
  }: {
    empresa: string;
    cardNumber: string;
    category: string;
    taxIndicator: string;
    distributionRule: string;
    responsable: string;
    motivo: string;
    descripcion: string;
    importe: number;
    comment?: string;
    comprobacionId: number;
    approverId: number;
    accountCode?: string;
  }): Promise<FactProvResponse> {
    // 1. Match de tarjeta
    const cardMatch = await this.cardMatchService.matchCardWithServiceLayer(
      empresa,
      cardNumber,
    );
    if (!cardMatch.success || !cardMatch.data) {
      return {
        success: false,
        message: cardMatch.message,
        error: cardMatch.error,
      };
    }
    // 2. Obtener accountCode
    let finalAccountCode = accountCode;
    if (!finalAccountCode) {
      const accountsResp =
        await this.wholesaleAccountsService.findAccountsByCode('', empresa);
      const account = accountsResp.data?.find((acc) => acc.Name === category);
      if (!account) {
        return {
          success: false,
          message: 'No se encontró la cuenta mayorista para la categoría',
          error: 'Cuenta no encontrada',
        };
      }
      finalAccountCode = account.Code;
    }
    // 3. Buscar taxcode
    const taxcodes = await this.salesTaxcodeService.getTaxCodes(empresa);
    const taxcode = taxcodes.find((tc) => tc.Name === taxIndicator);
    if (!taxcode) {
      return {
        success: false,
        message: 'No se encontró el código de impuestos',
        error: 'TaxCode no encontrado',
      };
    }
    // 4. Buscar distributionRule
    const distRulesResp =
      await this.distributionRulesService.getFactorDescriptions(empresa);
    const distRule = distRulesResp.data?.find((dr) => dr === distributionRule);
    if (!distRule) {
      return {
        success: false,
        message: 'No se encontró la norma de reparto',
        error: 'DistributionRule no encontrada',
      };
    }
    // 5. Armar objeto ServiceLayerInvoiceData
    const today = new Date();
    const docDate = today.toISOString().split('T')[0];
    const docDueDate = new Date(today);
    docDueDate.setDate(docDueDate.getDate() + 30);
    const invoiceData: ServiceLayerInvoiceData = {
      CardCode: cardMatch.data.CardCode,
      DocDate: docDate,
      DocDueDate: docDueDate.toISOString().split('T')[0],
      TaxDate: docDate,
      DocTotal: importe,
      DocTotalFC: importe,
      Comments:
        comment || `Vale/ticket generado para ${responsable} - ${motivo}`,
      JournalMemo: `Vale/ticket ${motivo}`,
      DocumentLines: [
        {
          Quantity: 1,
          UnitPrice: importe,
          LineTotal: importe,
          TaxCode: taxcode.Code,
          AccountCode: finalAccountCode,
          LineMemo: descripcion,
        },
      ],
      DocType: 'dDocument_Service',
    };
    // 6. Enviar a Service Layer
    const invoiceResult = await this.serviceLayerInvoiceService.createInvoice(
      empresa,
      invoiceData,
      comprobacionId,
      approverId,
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
      message: 'Vale/ticket enviado como factura proveedor exitosamente.',
      data: {
        invoiceId: invoiceResult.invoiceId,
        cardMatch: cardMatch.data,
        importe,
        responsable,
        motivo,
        descripcion,
        category,
        taxIndicator,
        distributionRule,
        accountCode: finalAccountCode,
      },
    };
  }
}
