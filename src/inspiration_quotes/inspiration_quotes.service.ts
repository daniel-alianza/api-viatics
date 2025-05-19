import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateInspirationQuoteDto } from './dto/create-inspiration-quote.dto';

@Injectable()
export class InspirationQuotesService {
  constructor(private prisma: PrismaClient) {}

  async create(
    createInspirationQuoteDto: CreateInspirationQuoteDto,
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const quote = await this.prisma.inspirationQuote.create({
        data: createInspirationQuoteDto,
      });

      return {
        success: true,
        data: quote,
        message: 'Cita inspiradora creada exitosamente',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Error al crear la cita inspiradora',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async findAll(): Promise<{
    success: boolean;
    data: any[];
    message: string;
  }> {
    try {
      const quotes = await this.prisma.inspirationQuote.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: quotes,
        message:
          quotes.length > 0
            ? 'Citas inspiradoras encontradas'
            : 'No hay citas inspiradoras disponibles',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Error al obtener las citas inspiradoras',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async findOne(
    id: number,
  ): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const quote = await this.prisma.inspirationQuote.findUnique({
        where: { id },
      });

      if (!quote) {
        throw new NotFoundException({
          success: false,
          message: `No se encontró la cita inspiradora con ID ${id}`,
        });
      }

      return {
        success: true,
        data: quote,
        message: 'Cita inspiradora encontrada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Error al obtener la cita inspiradora',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const quote = await this.prisma.inspirationQuote.findUnique({
        where: { id },
      });

      if (!quote) {
        throw new NotFoundException({
          success: false,
          message: `No se encontró la cita inspiradora con ID ${id}`,
        });
      }

      await this.prisma.inspirationQuote.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Cita inspiradora eliminada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        message: 'Error al eliminar la cita inspiradora',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}
