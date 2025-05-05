import { IsString, IsInt, Min } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  branchId: number;
}
