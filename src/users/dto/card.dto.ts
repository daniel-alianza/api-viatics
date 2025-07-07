import {
  IsString,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  limite?: number;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  limite?: number;

  @IsNumber()
  @IsOptional()
  companyId?: number;
}
