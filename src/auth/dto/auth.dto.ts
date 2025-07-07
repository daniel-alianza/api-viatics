import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail({}, { message: 'Necesitas un email para iniciar sesión' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsNumber()
  companyId?: number;

  @IsNumber()
  branchId?: number;

  @IsNumber()
  areaId?: number;

  @IsOptional()
  @IsNumber()
  managerId?: number;
}

export class LoginDto {
  @IsEmail({}, { message: 'Necesitas un email para iniciar sesión' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  password: string;
}
