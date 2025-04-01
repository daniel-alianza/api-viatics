import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CompaniesService {
  async findAll() {
    return await prisma.company.findMany();
  }

  async create(data: { name: string }) {
    return await prisma.company.create({
      data,
    });
  }
}
