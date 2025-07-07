import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum ComprobacionStatus {
  PENDIENTE = 'pendiente',
  COMPROBADA = 'comprobada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ComprobacionStatus)
  status: ComprobacionStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}
