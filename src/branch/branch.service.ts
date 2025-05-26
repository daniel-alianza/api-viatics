import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Branch, Prisma } from '@prisma/client';
import { CreateBranchDto } from './dto/branch.dto';

const prisma = new PrismaClient();

@Injectable()
export class BranchService {
  async create(data: CreateBranchDto): Promise<Branch> {
    try {
      // Verificar si la compañía existe
      const companyExists = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!companyExists) {
        throw new BadRequestException(
          `No se puede crear la sucursal porque la compañía con ID ${data.companyId} no existe. ` +
            'Por favor, verifique que la compañía esté registrada en el sistema.',
        );
      }

      // Verificar si ya existe una sucursal con el mismo nombre en la misma compañía
      const existingBranch = await prisma.branch.findFirst({
        where: {
          name: data.name,
          companyId: data.companyId,
        },
      });

      if (existingBranch) {
        throw new BadRequestException(
          `No se puede crear la sucursal porque ya existe una con el nombre "${data.name}" ` +
            `en la compañía con ID ${data.companyId}. ` +
            'Por favor, utilice un nombre diferente para la sucursal.',
        );
      }

      return await prisma.branch.create({
        data: {
          name: data.name,
          companyId: data.companyId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Error de duplicación: Ya existe una sucursal con este nombre en la compañía. ' +
              'El sistema no permite sucursales duplicadas en la misma compañía.',
          );
        }
        throw new BadRequestException(
          `Error en la base de datos: ${error.message}. ` +
            'Por favor, contacte al administrador del sistema si el problema persiste.',
        );
      }
      throw error;
    }
  }

  async findAll(companyId: number): Promise<Branch[]> {
    try {
      // Verificar si la compañía existe
      const companyExists = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!companyExists) {
        throw new NotFoundException(
          `No se encontraron sucursales porque la compañía con ID ${companyId} no existe. ` +
            'Por favor, verifique que la compañía esté registrada en el sistema.',
        );
      }

      const branches = await prisma.branch.findMany({
        where: {
          companyId: companyId,
        },
      });

      if (branches.length === 0) {
        throw new NotFoundException(
          `No se encontraron sucursales registradas para la compañía con ID ${companyId}. ` +
            'Esto puede deberse a que aún no se han creado sucursales para esta compañía.',
        );
      }

      return branches;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          `Error en la base de datos: ${error.message}. ` +
            'Por favor, contacte al administrador del sistema si el problema persiste.',
        );
      }
      throw error;
    }
  }
}
