import { Injectable } from '@nestjs/common';
import { GenerateFactProvDto } from '../dto/generate-fact-prov.dto';
import {
  ServiceLayerInvoiceData,
  ServiceLayerInvoiceLine,
} from '../interfaces/fact-prov.interface';

@Injectable()
export class InvoiceTransformerService {
  transformXmlToServiceLayer(
    xmlData: GenerateFactProvDto,
    cardCode: string,
    comments?: string,
    accountCode?: string,
    taxCode?: string,
    itemCode?: string,
  ): ServiceLayerInvoiceData {
    const docDate = new Date(xmlData.Comprobante.Fecha)
      .toISOString()
      .split('T')[0];
    const docDueDate = new Date(xmlData.Comprobante.Fecha);
    docDueDate.setDate(docDueDate.getDate() + 30); // 30 días de plazo por defecto

    const documentLines: ServiceLayerInvoiceLine[] = xmlData.Conceptos.map(
      (concepto) => {
        const line: any = {
          Quantity: concepto.Cantidad,
          UnitPrice: concepto.ValorUnitario,
          LineTotal: concepto.Importe,
          LineMemo: concepto.Descripcion,
        };

        // Si se proporciona itemCode, usarlo; si no, usar solo AccountCode y TaxCode
        if (itemCode) {
          line.ItemCode = itemCode;
        }

        // AccountCode y TaxCode son obligatorios para facturas de proveedor
        if (accountCode) line.AccountCode = accountCode;
        if (taxCode) line.TaxCode = taxCode;

        return line;
      },
    );

    return {
      CardCode: cardCode,
      DocDate: docDate,
      DocDueDate: docDueDate.toISOString().split('T')[0],
      TaxDate: docDate,
      DocTotal: xmlData.Comprobante.Total,
      DocTotalFC: xmlData.Comprobante.Total,
      Comments:
        comments ||
        `Factura generada desde XML - Folio: ${xmlData.Comprobante.Folio}`,
      JournalMemo: `Factura proveedor ${xmlData.Comprobante.Serie}-${xmlData.Comprobante.Folio}`,
      DocumentLines: documentLines,
      DocType: 'dDocument_Service',
    };
  }

  private getTaxCode(traslados: any[]): string {
    // Lógica para determinar el código de impuesto basado en los traslados
    const ivaTraslado = traslados.find(
      (t) => t.Impuesto === '002' && t.TipoFactor === 'Tasa',
    );
    if (ivaTraslado && ivaTraslado.TasaOCuota === 0.16) {
      return 'IVA ACREDITABLE 16% (COMPRAS)'; // Código válido para IVA 16%
    }
    return 'IVA ACREDITABLE 0%'; // Código para IVA 0% o exento
  }
}
