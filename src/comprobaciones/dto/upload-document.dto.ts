import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentType {
  FACTURA = 'factura',
  TICKET = 'ticket',
}

export class UploadDocumentDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  comprobacionId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  responsable?: string;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  motivo?: string;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  importe?: number;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  sequence: string;

  @IsString()
  @IsNotEmpty()
  movimientoRef: string;

  @IsString()
  @IsNotEmpty()
  movimientoAcctName: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  movimientoDebAmount: number;

  @IsString()
  @IsNotEmpty()
  movimientoMemo: string;

  @IsString()
  @IsNotEmpty()
  movimientoDueDate: string;

  // Campos para vales/tickets (obligatorios para tickets, opcionales para facturas)
  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  cuentaPorMayor?: string;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  indicadorImpuestos?: string;

  @ValidateIf((o) => o.type === DocumentType.TICKET)
  @IsString()
  @IsNotEmpty()
  normaReparto?: string;

  // Campos para facturas (opcionales, se obtienen del XML)
  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  rfcProveedor?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  razonSocial?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  uuid?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  fechaEmision?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  iva?: number;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  total?: number;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  formaPago?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  usoCfdi?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  serie?: string;

  @ValidateIf((o) => o.type === DocumentType.FACTURA)
  @IsString()
  @IsOptional()
  folio?: string;
}
