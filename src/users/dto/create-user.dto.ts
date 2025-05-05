import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  companyId: number;

  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @IsNumber()
  @IsNotEmpty()
  areaId: number;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsString()
  @IsOptional()
  phone?: string;
}
