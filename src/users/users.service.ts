import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, User, Card, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        include: {
          company: true,
          branch: true,
          area: true,
          role: true,
          cards: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
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

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Si se está actualizando el email, verificar que no exista
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El email ya está en uso');
        }
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: number): Promise<User> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async assignCard(id: number, cardNumber: string): Promise<User> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar si la tarjeta ya existe
      const existingCard = await this.prisma.card.findUnique({
        where: { cardNumber },
      });

      if (existingCard) {
        throw new ConflictException('Esta tarjeta ya está registrada');
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          cards: {
            create: {
              cardNumber,
              isActive: true,
              limite: 0.01,
            },
          },
        },
        include: {
          company: true,
          branch: true,
          area: true,
          role: true,
          cards: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al asignar la tarjeta');
    }
  }

  async removeCard(cardId: number) {
    try {
      // Verificar si la tarjeta existe
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        throw new NotFoundException('Tarjeta no encontrada');
      }

      return await this.prisma.card.delete({
        where: { id: cardId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la tarjeta');
    }
  }

  async updateCard(
    cardId: number,
    data: { cardNumber?: string; isActive?: boolean; limite?: number },
  ): Promise<Card> {
    try {
      // Verificar que la tarjeta existe
      const card = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        throw new NotFoundException('Tarjeta no encontrada');
      }

      // Si se está actualizando el número de tarjeta, verificar que no exista
      if (data.cardNumber && data.cardNumber !== card.cardNumber) {
        const existingCard = await this.prisma.card.findUnique({
          where: { cardNumber: data.cardNumber },
        });

        if (existingCard && existingCard.id !== cardId) {
          throw new ConflictException('Este número de tarjeta ya está en uso');
        }
      }

      // Validar el límite si se está actualizando
      if (data.limite !== undefined && data.limite < 0) {
        throw new BadRequestException('El límite no puede ser negativo');
      }

      return await this.prisma.card.update({
        where: { id: cardId },
        data: {
          ...data,
          cardNumber: data.cardNumber || card.cardNumber,
          isActive: data.isActive !== undefined ? data.isActive : card.isActive,
          limite: data.limite || card.limite,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la tarjeta');
    }
  }
}
