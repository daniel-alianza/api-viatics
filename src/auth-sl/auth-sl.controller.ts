import { Controller, Get, Param } from '@nestjs/common';
import { AuthSlService } from './auth-sl.service';
import { ApiResponse } from './interfaces/auth.interface';

@Controller('auth')
export class AuthSlController {
  constructor(private readonly authSlService: AuthSlService) {}

  @Get('login/:empresa')
  async login(@Param('empresa') empresa: string): Promise<ApiResponse> {
    return this.authSlService.login(empresa);
  }
}
