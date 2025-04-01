import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    companyId?: number;
    branchId?: number;
    areaId?: number;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData: Prisma.UserUncheckedCreateInput = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      companyId: data.companyId || null,
      branchId: data.branchId || null,
      areaId: data.areaId || null,
      roleId: 2, // ID del rol empleado
    };

    return await prisma.user.create({ data: userData });
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        company: true,
        branch: true,
        area: true,
        role: true,
        cards: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
