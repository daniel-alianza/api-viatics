import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      companyId?: number;
      branchId?: number;
      areaId?: number;
    },
  ) {
    return await this.authService.register(data);
  }

  @Post('login')
  async login(
    @Body()
    data: {
      email: string;
      password: string;
    },
  ) {
    return await this.authService.login(data);
  }
}
