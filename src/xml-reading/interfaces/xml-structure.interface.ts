export interface XmlAttribute {
  $: {
    [key: string]: string;
  };
}

export interface XmlImpuesto extends XmlAttribute {
  $: {
    Importe: string;
    [key: string]: string;
  };
}

export interface XmlConcepto extends XmlAttribute {
  $: {
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
    [key: string]: string;
  };
  Impuestos?: Array<{
    Traslados?: Array<{
      Traslado: Array<{
        $: {
          Base: string;
          Impuesto: string;
          TipoFactor: string;
          TasaOCuota: string;
          Importe: string;
          [key: string]: string;
        };
      }>;
    }>;
  }>;
}

export interface XmlImpuestos {
  $?: {
    TotalImpuestosTrasladados: string;
    [key: string]: string;
  };
  Retenciones?: Array<{
    Impuesto: XmlImpuesto[];
  }>;
  Traslados?: Array<{
    Impuesto: XmlImpuesto[];
  }>;
}

export interface XmlEmisor extends XmlAttribute {
  $: {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
    RegimenFiscalDescripcion: string;
    [key: string]: string;
  };
}

export interface XmlReceptor extends XmlAttribute {
  $: {
    Rfc: string;
    UsoCFDI: string;
    UsoCFDIDescripcion: string;
    [key: string]: string;
  };
}

export interface XmlTimbreFiscal extends XmlAttribute {
  $: {
    UUID: string;
    [key: string]: string;
  };
}

export interface XmlComplemento {
  TimbreFiscalDigital?: XmlTimbreFiscal[];
}

export interface XmlComprobante extends XmlAttribute {
  $: {
    Fecha: string;
    Total: string;
    LugarExpedicion: string;
    FormaPago: string;
    FormaPagoDescripcion: string;
    [key: string]: string;
  };
  Emisor: XmlEmisor[];
  Receptor: XmlReceptor[];
  Impuestos?: XmlImpuestos[];
  Conceptos?: Array<{
    Concepto: XmlConcepto[];
  }>;
  Complemento?: XmlComplemento[];
}

export interface XmlResult {
  Comprobante: XmlComprobante;
}
