import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Area } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AreaService {
  async create(data: { name: string; branchId: number }): Promise<Area> {
    return await prisma.area.create({
      data: {
        name: data.name,
        branchId: data.branchId,
      },
    });
  }

  async findAll(branchId: number): Promise<Area[]> {
    const areas = await prisma.area.findMany({
      where: {
        branchId: branchId,
      },
    });

    if (areas.length === 0) {
      throw new NotFoundException('No se encontraron áreas para esta sucursal');
    }

    return areas;
  }
}
