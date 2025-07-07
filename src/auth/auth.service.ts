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
          'Los campos nombre, email y contraseña son obligatorios. ' +
            'Por favor, complete todos los campos requeridos.',
        );
      }

      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestException(
          'El formato del email no es válido. ' +
            'Por favor, ingrese un email válido (ejemplo: usuario@dominio.com).',
        );
      }

      // Validación de longitud de contraseña
      if (data.password.length < 8) {
        throw new BadRequestException(
          'La contraseña debe tener al menos 8 caracteres. ' +
            'Por favor, elija una contraseña más segura.',
        );
      }

      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException(
          `El email ${data.email} ya está registrado en el sistema. ` +
            'Por favor, utilice otro email o inicie sesión si ya tiene una cuenta.',
        );
      }

      // Verificar si la compañía existe si se proporciona
      if (data.companyId) {
        const companyExists = await prisma.company.findUnique({
          where: { id: data.companyId },
        });

        if (!companyExists) {
          throw new BadRequestException(
            `No se puede registrar el usuario porque la compañía con ID ${data.companyId} no existe. ` +
              'Por favor, verifique que la compañía esté registrada en el sistema.',
          );
        }
      }

      // Verificar si la sucursal existe si se proporciona
      if (data.branchId) {
        const branchExists = await prisma.branch.findUnique({
          where: { id: data.branchId },
        });

        if (!branchExists) {
          throw new BadRequestException(
            `No se puede registrar el usuario porque la sucursal con ID ${data.branchId} no existe. ` +
              'Por favor, verifique que la sucursal esté registrada en el sistema.',
          );
        }
      }

      // Verificar si el área existe si se proporciona
      if (data.areaId) {
        const areaExists = await prisma.area.findUnique({
          where: { id: data.areaId },
        });

        if (!areaExists) {
          throw new BadRequestException(
            `No se puede registrar el usuario porque el área con ID ${data.areaId} no existe. ` +
              'Por favor, verifique que el área esté registrada en el sistema.',
          );
        }
      }

      // Verificar si el manager existe si se proporciona
      if (data.managerId) {
        const managerExists = await prisma.user.findUnique({
          where: { id: data.managerId },
        });

        if (!managerExists) {
          throw new BadRequestException(
            `No se puede registrar el usuario porque el manager con ID ${data.managerId} no existe. ` +
              'Por favor, verifique que el manager esté registrado en el sistema.',
          );
        }
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
        roleId: 4, // ID del rol empleado
      };

      const newUser = await prisma.user.create({
        data: userData,
        include: {
          company: true,
          branch: true,
          area: true,
          role: true,
          cards: {
            include: {
              company: true,
            },
          },
        },
      });

      const { password, ...userWithoutPassword } = newUser;
      return {
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'El email ya está registrado en el sistema. ' +
              'Por favor, utilice otro email o inicie sesión si ya tiene una cuenta.',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Error de referencia: Una de las entidades relacionadas no existe. ' +
              'Por favor, verifique que todas las referencias (compañía, sucursal, área, manager) sean válidas.',
          );
        }
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al registrar el usuario. ' +
          'Por favor, intente nuevamente o contacte al administrador del sistema si el problema persiste.',
      );
    }
  }

  async login(data: LoginDto) {
    try {
      if (!data.email || !data.password) {
        throw new BadRequestException(
          'Email y contraseña son requeridos para iniciar sesión. ' +
            'Por favor, complete todos los campos.',
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          company: true,
          branch: true,
          area: true,
          role: true,
          cards: {
            include: {
              company: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(
          `No se encontró ningún usuario con el email ${data.email}. ` +
            'Por favor, verifique el email o regístrese si aún no tiene una cuenta.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException(
          'La contraseña ingresada es incorrecta. ' +
            'Por favor, verifique su contraseña e intente nuevamente.',
        );
      }

      const { password, ...userWithoutPassword } = user;
      return {
        message: 'Inicio de sesión exitoso',
        user: userWithoutPassword,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al iniciar sesión. ' +
          'Por favor, intente nuevamente o contacte al administrador del sistema si el problema persiste.',
      );
    }
  }
}
