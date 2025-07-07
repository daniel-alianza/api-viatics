import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComprobanteDto {
  @IsString()
  @IsNotEmpty()
  Version: string;

  @IsString()
  @IsNotEmpty()
  Serie: string;

  @IsString()
  @IsNotEmpty()
  Folio: string;

  @IsDateString()
  Fecha: string;

  @IsString()
  @IsNotEmpty()
  FormaPago: string;

  @IsString()
  @IsOptional()
  CondicionesDePago?: string;

  @IsNumber()
  SubTotal: number;

  @IsNumber()
  @IsOptional()
  Descuento?: number;

  @IsString()
  @IsNotEmpty()
  Moneda: string;

  @IsNumber()
  Total: number;

  @IsString()
  @IsNotEmpty()
  TipoDeComprobante: string;

  @IsString()
  @IsNotEmpty()
  MetodoPago: string;

  @IsString()
  @IsNotEmpty()
  LugarExpedicion: string;

  @IsString()
  @IsNotEmpty()
  NoCertificado: string;

  @IsString()
  @IsNotEmpty()
  Sello: string;
}

export class EmisorDto {
  @IsString()
  @IsNotEmpty()
  Rfc: string;

  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @IsString()
  @IsNotEmpty()
  RegimenFiscal: string;
}

export class ReceptorDto {
  @IsString()
  @IsNotEmpty()
  Rfc: string;

  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @IsString()
  @IsNotEmpty()
  UsoCFDI: string;

  @IsString()
  @IsNotEmpty()
  DomicilioFiscalReceptor: string;

  @IsString()
  @IsNotEmpty()
  RegimenFiscalReceptor: string;
}

export class TrasladoDto {
  @IsNumber()
  Base: number;

  @IsString()
  @IsNotEmpty()
  Impuesto: string;

  @IsString()
  @IsNotEmpty()
  TipoFactor: string;

  @IsOptional()
  @IsNumber()
  TasaOCuota?: number;

  @IsOptional()
  @IsNumber()
  Importe?: number;
}

export class ImpuestosConceptoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrasladoDto)
  Traslados: TrasladoDto[];
}

export class ACuentaTercerosDto {
  @IsString()
  @IsNotEmpty()
  RfcACuentaTerceros: string;

  @IsString()
  @IsNotEmpty()
  NombreACuentaTerceros: string;

  @IsString()
  @IsNotEmpty()
  RegimenFiscalACuentaTerceros: string;

  @IsString()
  @IsNotEmpty()
  DomicilioFiscalACuentaTerceros: string;
}

export class ConceptoDto {
  @IsString()
  @IsNotEmpty()
  ClaveProdServ: string;

  @IsString()
  @IsNotEmpty()
  NoIdentificacion: string;

  @IsNumber()
  Cantidad: number;

  @IsString()
  @IsNotEmpty()
  ClaveUnidad: string;

  @IsString()
  @IsNotEmpty()
  Unidad: string;

  @IsString()
  @IsNotEmpty()
  Descripcion: string;

  @IsNumber()
  ValorUnitario: number;

  @IsNumber()
  Importe: number;

  @IsNumber()
  @IsOptional()
  Descuento?: number;

  @IsString()
  @IsNotEmpty()
  ObjetoImp: string;

  @ValidateNested()
  @Type(() => ImpuestosConceptoDto)
  Impuestos: ImpuestosConceptoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ACuentaTercerosDto)
  ACuentaTerceros?: ACuentaTercerosDto;
}

export class TrasladoImpuestoDto {
  @IsString()
  @IsNotEmpty()
  Impuesto: string;

  @IsString()
  @IsNotEmpty()
  TipoFactor: string;

  @IsOptional()
  @IsNumber()
  TasaOCuota?: number;

  @IsOptional()
  @IsNumber()
  Importe?: number;

  @IsOptional()
  @IsNumber()
  Base?: number;
}

export class ImpuestosDto {
  @IsNumber()
  TotalImpuestosTrasladados: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrasladoImpuestoDto)
  Traslados: TrasladoImpuestoDto[];
}

export class AerolineasDto {
  @IsString()
  @IsNotEmpty()
  Version: string;

  @IsNumber()
  TUA: number;

  @IsOptional()
  OtrosCargos?: any;
}

export class TimbreFiscalDigitalDto {
  @IsString()
  @IsNotEmpty()
  Version: string;

  @IsString()
  @IsNotEmpty()
  UUID: string;

  @IsDateString()
  FechaTimbrado: string;

  @IsString()
  @IsNotEmpty()
  RfcProvCertif: string;

  @IsString()
  @IsNotEmpty()
  NoCertificadoSAT: string;

  @IsString()
  @IsNotEmpty()
  SelloCFD: string;

  @IsString()
  @IsNotEmpty()
  SelloSAT: string;
}

export class ComplementoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AerolineasDto)
  Aerolineas?: AerolineasDto;

  @ValidateNested()
  @Type(() => TimbreFiscalDigitalDto)
  TimbreFiscalDigital: TimbreFiscalDigitalDto;
}

export class GenerateFactProvDto {
  @ValidateNested()
  @Type(() => ComprobanteDto)
  Comprobante: ComprobanteDto;

  @ValidateNested()
  @Type(() => EmisorDto)
  Emisor: EmisorDto;

  @ValidateNested()
  @Type(() => ReceptorDto)
  Receptor: ReceptorDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptoDto)
  Conceptos: ConceptoDto[];

  @ValidateNested()
  @Type(() => ImpuestosDto)
  Impuestos: ImpuestosDto;

  @ValidateNested()
  @Type(() => ComplementoDto)
  Complemento: ComplementoDto;
}

export class GenerateFactProvRequestDto {
  @IsString()
  @IsNotEmpty()
  empresa: string;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ValidateNested()
  @Type(() => GenerateFactProvDto)
  xmlData: GenerateFactProvDto;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  accountCode?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  taxName?: string;

  @IsOptional()
  @IsNumber()
  comprobacionId?: number;

  @IsOptional()
  @IsNumber()
  approverId?: number;
}
