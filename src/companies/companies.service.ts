import { Injectable } from '@nestjs/common';
import { PrismaClient, Company } from '@prisma/client';
import { CreateCompanyDto } from './dto/company.dto';

const prisma = new PrismaClient();

@Injectable()
export class CompaniesService {
  async findAll(): Promise<Company[]> {
    return await prisma.company.findMany();
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    return await prisma.company.create({
      data,
    });
  }
}
