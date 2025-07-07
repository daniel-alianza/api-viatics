import { IsInt, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsInt()
  userId: number;

  @IsString()
  viewName: string;
}
