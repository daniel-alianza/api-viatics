import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateInspirationQuoteDto {
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @MaxLength(500, {
    message: 'El contenido no puede exceder los 500 caracteres',
  })
  content: string;

  @IsString({ message: 'El autor debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, {
    message: 'El nombre del autor no puede exceder los 100 caracteres',
  })
  author?: string;
}
