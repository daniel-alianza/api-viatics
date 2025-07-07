import { IsString, IsDate, IsOptional } from 'class-validator';

export class CreateMovementDto {
  @IsOptional()
  @IsString()
  accountCode?: string;

  @IsString()
  cardNumber: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
