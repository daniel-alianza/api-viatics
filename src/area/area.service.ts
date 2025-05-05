import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Area, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AreaService {
  async create(data: { name: string; branchId: number }): Promise<Area> {
    try {
      // Verificar si la sucursal existe
      const branchExists = await prisma.branch.findUnique({
        where: { id: data.branchId },
      });

      if (!branchExists) {
        throw new BadRequestException(
          `No se puede crear el área porque la sucursal con ID ${data.branchId} no existe. ` +
            'Por favor, verifique que la sucursal esté registrada en el sistema.',
        );
      }

      // Verificar si ya existe un área con el mismo nombre en la misma sucursal
      const existingArea = await prisma.area.findFirst({
        where: {
          name: data.name,
          branchId: data.branchId,
        },
      });

      if (existingArea) {
        throw new BadRequestException(
          `No se puede crear el área porque ya existe un área con el nombre "${data.name}" ` +
            `en la sucursal con ID ${data.branchId}. ` +
            'Por favor, utilice un nombre diferente para el área.',
        );
      }

      return await prisma.area.create({
        data: {
          name: data.name,
          branchId: data.branchId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Error de duplicación: Ya existe un área con este nombre en la sucursal. ' +
              'El sistema no permite áreas duplicadas en la misma sucursal.',
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

  async findAll(branchId: number): Promise<Area[]> {
    try {
      // Verificar si la sucursal existe
      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branchExists) {
        throw new NotFoundException(
          `No se encontraron áreas porque la sucursal con ID ${branchId} no existe. ` +
            'Por favor, verifique que la sucursal esté registrada en el sistema.',
        );
      }

      const areas = await prisma.area.findMany({
        where: {
          branchId: branchId,
        },
      });

      if (areas.length === 0) {
        throw new NotFoundException(
          `No se encontraron áreas registradas para la sucursal con ID ${branchId}. ` +
            'Esto puede deberse a que aún no se han creado áreas para esta sucursal.',
        );
      }

      return areas;
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
