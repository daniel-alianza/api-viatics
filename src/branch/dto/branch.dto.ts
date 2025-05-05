import { IsString, IsInt, MinLength, Min } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(1)
  companyId: number;
}
