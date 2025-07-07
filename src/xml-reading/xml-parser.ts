import { parse } from 'fast-xml-parser';

// Custom type definition for ParserOptions
interface ParserOptions {
  ignoreAttributes?: boolean;
  attributeNamePrefix?: string;
  textNodeName?: string;
  ignoreNameSpace?: boolean;
  attrNodeName?: string;
  allowBooleanAttributes?: boolean;
  parseNodeValue?: boolean;
  parseAttributeValue?: boolean;
  trimValues?: boolean;
  cdataTagName?: string;
  cdataPositionChar?: string;
  localeRange?: string;
  parseTrueNumberOnly?: boolean;
  arrayMode?: boolean;
  stopNodes?: string[];
  emptyTag?: string;
}

interface Traslado {
  Base: string;
  Impuesto: string;
  TipoFactor: string;
  TasaOCuota: string;
  Importe: string;
}

interface Concept {
  ClaveProdServ: string;
  NoIdentificacion: string;
  Cantidad: string;
  ClaveUnidad: string;
  Unidad: string;
  Descripcion: string;
  ValorUnitario: string;
  Importe: string;
  Descuento: string;
  ObjetoImp: string;
  Impuestos?: {
    Traslados?: {
      Traslado: Traslado[];
    };
  };
  ACuentaTerceros?: {
    RfcACuentaTerceros: string;
    NombreACuentaTerceros: string;
    RegimenFiscalACuentaTerceros: string;
    DomicilioFiscalACuentaTerceros: string;
  };
}

interface ParsedData {
  general: {
    fechaEmision: string;
    total: string;
    lugarExpedicion: string;
    rfcEmisor: string;
    razonSocialEmisor: string;
    regimenFiscalEmisor: string;
    regimenFiscalEmisorDesc: string;
    rfcReceptor: string;
    regimenFiscalReceptor: string;
    regimenFiscalReceptorDesc: string;
    usoCFDI: string;
    folioFiscal: string;
    formaPago: string;
    formaPagoLetra: string;
    metodoPago: string;
    metodoPagoLetra: string;
    totalImpuestosRetenidos: string;
    totalTraslados: string;
  };
  conceptos: Concept[];
  traslados: Traslado[];
}

export const parseXML = (xml: string): ParsedData => {
  try {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      ignoreNameSpace: false,
      attrNodeName: 'attr',
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: '__cdata',
      cdataPositionChar: '\n',
      localeRange: '',
      parseTrueNumberOnly: false,
      arrayMode: false,
      stopNodes: [],
      emptyTag: ''
    };

    const parsed = parse(xml, options);
    const comprobante = parsed['cfdi:Comprobante'];
    
    // Extract general data
    const generalData = {
      fechaEmision: comprobante.Fecha,
      total: comprobante.Total,
      lugarExpedicion: comprobante.LugarExpedicion,
      rfcEmisor: comprobante['cfdi:Emisor'].Rfc,
      razonSocialEmisor: comprobante['cfdi:Emisor'].Nombre,
      regimenFiscalEmisor: comprobante['cfdi:Emisor'].RegimenFiscal,
      regimenFiscalEmisorDesc: getRegimenFiscalDesc(comprobante['cfdi:Emisor'].RegimenFiscal),
      rfcReceptor: comprobante['cfdi:Receptor'].Rfc,
      regimenFiscalReceptor: comprobante['cfdi:Receptor'].RegimenFiscalReceptor,
      regimenFiscalReceptorDesc: getRegimenFiscalDesc(comprobante['cfdi:Receptor'].RegimenFiscalReceptor),
      usoCFDI: comprobante['cfdi:Receptor'].UsoCFDI,
      folioFiscal: comprobante['cfdi:Complemento']['tfd:TimbreFiscalDigital'].UUID,
      formaPago: comprobante.FormaPago,
      formaPagoLetra: getFormaPagoDesc(comprobante.FormaPago),
      metodoPago: comprobante.MetodoPago,
      metodoPagoLetra: getMetodoPagoDesc(comprobante.MetodoPago),
      totalImpuestosRetenidos: '0.00',
      totalTraslados: comprobante['cfdi:Impuestos'].TotalImpuestosTrasladados
    };

    // Extract concepts
    const conceptos = comprobante['cfdi:Conceptos']['cfdi:Concepto'];
    const concepts = Array.isArray(conceptos) ? conceptos : [conceptos];

    // Extract traslados
    const traslados: Traslado[] = [];
    const impuestos = comprobante['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'];
    
    if (impuestos) {
      if (Array.isArray(impuestos)) {
        traslados.push(...impuestos);
      } else {
        traslados.push(impuestos as Traslado);
      }
    }

    return {
      general: generalData,
      conceptos: concepts,
      traslados: traslados
    };
  } catch (error) {
    throw new Error(`Error parsing XML: ${error.message}`);
  }
};

// Helper functions for descriptions
const getRegimenFiscalDesc = (codigo: string): string => {
  const regimenMap = {
    '601': 'Persona Física con Actividades Empresariales y Profesionales',
    // Add more regimen fiscal descriptions as needed
  };
  return regimenMap[codigo] || 'Desconocido';
};

const getFormaPagoDesc = (codigo: string): string => {
  const formaPagoMap = {
    '28': 'Pago en una sola exhibición'
  };
  return formaPagoMap[codigo] || 'Desconocido';
};

const getMetodoPagoDesc = (codigo: string): string => {
  const metodoPagoMap = {
    'PUE': 'Pago en una sola exhibición'
  };
  return metodoPagoMap[codigo] || 'Desconocido';
};
