import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  async register(data: RegisterDto) {
    try {
      // Validación de datos requeridos
      if (!data.name || !data.email || !data.password) {
        throw new BadRequestException(
          'Nombre, email y contraseña son requeridos',
        );
      }

      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestException('El formato del email no es válido');
      }

      // Validación de longitud de contraseña
      if (data.password.length < 8) {
        throw new BadRequestException(
          'La contraseña debe tener al menos 8 caracteres',
        );
      }

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('El email ya está registrado');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const userData: Prisma.UserUncheckedCreateInput = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyId: data.companyId || null,
        branchId: data.branchId || null,
        areaId: data.areaId || null,
        managerId: data.managerId || null,
        roleId: 2, // ID del rol empleado
      };

      return await prisma.user.create({ data: userData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('El email ya está registrado');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Referencia a entidad no válida');
        }
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async login(data: LoginDto) {
    try {
      if (!data.email || !data.password) {
        throw new BadRequestException('Email y contraseña son requeridos');
      }

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

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }
}
