import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Branch } from '@prisma/client';
import { CreateBranchDto } from './dto/branch.dto';

const prisma = new PrismaClient();

@Injectable()
export class BranchService {
  async create(data: CreateBranchDto): Promise<Branch> {
    return await prisma.branch.create({
      data: {
        name: data.name,
        companyId: data.companyId,
      },
    });
  }

  async findAll(companyId: number): Promise<Branch[]> {
    const branches = await prisma.branch.findMany({
      where: {
        companyId: companyId,
      },
    });

    if (branches.length === 0) {
      throw new NotFoundException(
        'No se encontraron sucursales para esta compañía',
      );
    }

    return branches;
  }
}
