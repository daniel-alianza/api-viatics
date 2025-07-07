import { Injectable } from '@nestjs/common';
import { XmlData } from './interfaces/xml-data.interface';
import {
  XmlComprobante,
  XmlEmisor,
  XmlReceptor,
  XmlImpuestos,
  XmlResult,
  XmlConcepto,
} from './interfaces/xml-structure.interface';
import * as xml2js from 'xml2js';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class XmlReadingService {
  constructor(private readonly prisma: PrismaClient) {}

  async parseXmlFile(filePath: string): Promise<XmlData> {
    try {
      const xmlContent = readFileSync(filePath, 'utf-8');
      const parser = new xml2js.Parser({
        explicitArray: true,
        tagNameProcessors: [xml2js.processors.stripPrefix],
      });
      const result = (await parser.parseStringPromise(xmlContent)) as XmlResult;
      const comprobante: XmlComprobante = result.Comprobante;
      const emisor: XmlEmisor = comprobante.Emisor[0];
      const receptor: XmlReceptor = comprobante.Receptor[0];
      const impuestos: XmlImpuestos = comprobante.Impuestos?.[0] || {};
      const conceptosArr: XmlConcepto[] =
        comprobante.Conceptos?.[0]?.Concepto || [];

      // Folio fiscal UUID
      let folioFiscal = '';
      if (comprobante.Complemento?.[0]?.TimbreFiscalDigital?.[0]?.$?.UUID) {
        folioFiscal = comprobante.Complemento[0].TimbreFiscalDigital[0].$.UUID;
      }

      const conceptos = conceptosArr.map((concepto) => {
        const c = concepto.$;
        const traslados =
          concepto.Impuestos?.[0]?.Traslados?.[0]?.Traslado?.map((t) => ({
            base: parseFloat(t.$.Base),
            impuesto: t.$.Impuesto,
            tipoFactor: t.$.TipoFactor,
            tasaOCuota: parseFloat(t.$.TasaOCuota),
            importe: parseFloat(t.$.Importe),
          })) || [];

        return {
          claveProdServ: c.ClaveProdServ,
          noIdentificacion: c.NoIdentificacion,
          cantidad: parseFloat(c.Cantidad),
          claveUnidad: c.ClaveUnidad,
          unidad: c.Unidad,
          descripcion: c.Descripcion,
          valorUnitario: parseFloat(c.ValorUnitario),
          importe: parseFloat(c.Importe),
          descuento: parseFloat(c.Descuento),
          objetoImp: c.ObjetoImp,
          traslados,
        };
      });

      return {
        fechaEmision: comprobante.$.Fecha,
        total: parseFloat(comprobante.$.Total),
        lugarExpedicion: comprobante.$.LugarExpedicion,
        serie: comprobante.$.Serie || '',
        folio: comprobante.$.Folio || '',
        condicionesDePago: comprobante.$.CondicionesDePago || '',
        tipoDeComprobante: comprobante.$.TipoDeComprobante || '',
        noCertificado: comprobante.$.NoCertificado || '',
        sello: comprobante.$.Sello || '',
        subTotal: parseFloat(comprobante.$.SubTotal || '0'),
        descuento: parseFloat(comprobante.$.Descuento || '0'),
        moneda: comprobante.$.Moneda || '',
        emisor: {
          rfc: emisor.$.Rfc,
          razonSocial: emisor.$.Nombre,
          regimenFiscal: emisor.$.RegimenFiscal,
          regimenFiscalDescripcion:
            emisor.$.RegimenFiscalDescripcion || emisor.$.RegimenFiscal,
        },
        receptor: {
          rfc: receptor.$.Rfc,
          regimenFiscal: receptor.$.RegimenFiscalReceptor,
          regimenFiscalDescripcion:
            receptor.$.RegimenFiscalReceptorDescripcion ||
            receptor.$.RegimenFiscalReceptor,
          usoCFDI: receptor.$.UsoCFDI,
          usoCFDIDescripcion:
            receptor.$.UsoCFDIDescripcion || receptor.$.UsoCFDI,
        },
        conceptos,
        folioFiscal,
        formaPago: comprobante.$.FormaPago,
        formaPagoLetra:
          comprobante.$.FormaPagoDescripcion || comprobante.$.FormaPago,
        metodoPago: comprobante.$.MetodoPago,
        metodoPagoLetra:
          comprobante.$.MetodoPagoDescripcion || comprobante.$.MetodoPago,
        impuestos: {
          retenidos: this.calcularTotalImpuestos(impuestos.Retenciones),
          traslados: impuestos.$?.TotalImpuestosTrasladados
            ? parseFloat(impuestos.$.TotalImpuestosTrasladados)
            : this.calcularTotalImpuestos(impuestos.Traslados),
        },
      };
    } catch (error: unknown) {
      console.error('Error al procesar el XML:', error);
      throw error;
    }
  }

  private calcularTotalImpuestos(
    impuestos:
      | Array<{ Impuesto: Array<{ $: { Importe: string } }> }>
      | undefined,
  ): number {
    if (!impuestos || !impuestos[0]?.Impuesto) return 0;
    return impuestos[0].Impuesto.reduce((total: number, impuesto) => {
      return total + parseFloat(impuesto.$.Importe || '0');
    }, 0);
  }

  async getXmlDataByViaticoAndUser(
    viaticoId: string,
    userId: number,
  ): Promise<XmlData> {
    // Buscar la comprobación
    const comprobacion = await this.prisma.comprobacion.findFirst({
      where: {
        viaticoId,
        userId,
        documents: {
          some: {
            type: 'factura_xml',
          },
        },
      },
      include: {
        documents: true,
      },
    });
    if (!comprobacion) {
      throw new Error(
        'No se encontró comprobación con XML para ese viático y usuario',
      );
    }
    // Buscar el documento XML
    const xmlDoc = comprobacion.documents.find(
      (doc) => doc.type === 'factura_xml',
    );
    if (!xmlDoc) {
      throw new Error(
        'No se encontró documento XML para ese viático y usuario',
      );
    }
    // Guardar el archivo temporalmente para procesarlo
    const tempPath = `./uploads/temp_${Date.now()}.xml`;
    const fs = await import('fs/promises');
    await fs.writeFile(tempPath, xmlDoc.fileContent);
    const data = await this.parseXmlFile(tempPath);
    await fs.unlink(tempPath);
    return data;
  }

  async getXmlDataByComprobacionOnly(comprobacionId: number): Promise<XmlData> {
    try {
      const comprobacion = await this.prisma.comprobacion.findUnique({
        where: { id: comprobacionId },
        include: { documents: true },
      });

      if (!comprobacion) {
        throw new Error('No se encontró la comprobación');
      }

      const xmlDoc = comprobacion.documents.find(
        (doc) => doc.type === 'factura_xml',
      );
      if (!xmlDoc) {
        throw new Error('No se encontró documento XML para esa comprobación');
      }

      // Aseguramos que fileContent sea un Buffer
      const fileBuffer = Buffer.isBuffer(xmlDoc.fileContent)
        ? xmlDoc.fileContent
        : Buffer.from(xmlDoc.fileContent);

      // Guardar el archivo temporalmente para procesarlo
      const tempPath = `./uploads/temp_${Date.now()}.xml`;
      const fs = await import('fs/promises');
      await fs.writeFile(tempPath, fileBuffer);
      const data = await this.parseXmlFile(tempPath);
      await fs.unlink(tempPath);
      return data;
    } catch (error) {
      console.error('Error al procesar el XML:', error);
      throw error;
    }
  }
}
