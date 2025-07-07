import { IsOptional, IsString } from 'class-validator';

export class SearchAccountsDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  empresa: string;
}

export interface AccountResponse {
  Code: string;
  Name: string;
  Active: string;
  // ... existing code ...
}
