import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Company, Prisma } from '@prisma/client';
import { CreateCompanyDto } from './dto/company.dto';

const prisma = new PrismaClient();

@Injectable()
export class CompaniesService {
  async findAll(): Promise<Company[]> {
    try {
      const companies = await prisma.company.findMany();

      if (companies.length === 0) {
        throw new NotFoundException(
          'No se encontraron compañías registradas en el sistema. ' +
            'Por favor, registre una compañía para comenzar.',
        );
      }

      return companies;
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

  async create(data: CreateCompanyDto): Promise<Company> {
    try {
      // Verificar si ya existe una compañía con el mismo nombre
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: data.name,
        },
      });

      if (existingCompany) {
        throw new BadRequestException(
          `No se puede crear la compañía porque ya existe una con el nombre "${data.name}". ` +
            'Por favor, utilice un nombre diferente.',
        );
      }

      const company = await prisma.company.create({
        data,
      });

      return company;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Error de duplicación: Ya existe una compañía con este nombre. ' +
              'El sistema no permite compañías duplicadas.',
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
}
