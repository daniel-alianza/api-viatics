import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateComprobacionDto {
  @IsNumber()
  @IsNotEmpty()
  viaticoId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  expenseRequestId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  approverId?: number;

  @IsString()
  @IsNotEmpty()
  sequence: string;
}
