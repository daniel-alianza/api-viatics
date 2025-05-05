import {
  IsNumber,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExpenseDetailDto {
  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class CreateExpenseRequestDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  travelReason: string;

  @IsDateString()
  departureDate: string;

  @IsDateString()
  returnDate: string;

  @IsDateString()
  disbursementDate: string;

  @IsString()
  @IsNotEmpty()
  travelObjectives: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseDetailDto)
  details: ExpenseDetailDto[];
}

export class UpdateExpenseRequestStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
