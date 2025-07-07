export interface XmlData {
  // Datos generales del comprobante
  fechaEmision: string;
  total: number;
  lugarExpedicion: string;

  // Nuevos campos requeridos
  serie: string;
  folio: string;
  condicionesDePago: string;
  tipoDeComprobante: string;
  noCertificado: string;
  sello: string;
  subTotal: number;
  descuento: number;
  moneda: string;

  // Emisor
  emisor: {
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
    regimenFiscalDescripcion: string;
  };

  // Receptor
  receptor: {
    rfc: string;
    regimenFiscal: string;
    regimenFiscalDescripcion: string;
    usoCFDI: string;
    usoCFDIDescripcion: string;
  };

  // Conceptos
  conceptos: Array<{
    claveProdServ: string;
    noIdentificacion: string;
    cantidad: number;
    claveUnidad: string;
    unidad: string;
    descripcion: string;
    valorUnitario: number;
    importe: number;
    descuento: number;
    objetoImp: string;
    traslados?: Array<{
      base: number;
      impuesto: string;
      tipoFactor: string;
      tasaOCuota: number;
      importe: number;
    }>;
  }>;

  // Identificadores
  folioFiscal: string;

  // Pago
  formaPago: string;
  formaPagoLetra: string;
  metodoPago: string;
  metodoPagoLetra: string;

  // Impuestos
  impuestos: {
    retenidos: number;
    traslados: number;
  };
}
