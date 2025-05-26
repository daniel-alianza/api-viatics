import { IsString, IsDateString, IsOptional } from 'class-validator';

export class GetMovementsDto {
  @IsString()
  cardNumber: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  ref?: string;
}
