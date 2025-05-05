import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, User, Card, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCardDto } from './dto/card.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
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
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

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
      console.error('Error al obtener los usuarios:', error);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: number): Promise<User> {
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Si se está actualizando el email, verificar que no exista
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (emailExists) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      // Si se está actualizando la contraseña, hacer hash
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
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
        include: {
          company: true,
          branch: true,
          area: true,
          role: true,
          cards: true,
        },
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
        throw new ConflictException(
          'La tarjeta ya está asignada a otro usuario',
        );
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          cards: {
            create: {
              cardNumber,
              isActive: true,
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

  async removeCard(cardId: number): Promise<Card> {
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
    updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    try {
      // Verificar si la tarjeta existe
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        throw new NotFoundException('Tarjeta no encontrada');
      }

      // Si se está actualizando el número de tarjeta, verificar que no exista
      if (
        updateCardDto.cardNumber &&
        updateCardDto.cardNumber !== existingCard.cardNumber
      ) {
        const cardExists = await this.prisma.card.findUnique({
          where: { cardNumber: updateCardDto.cardNumber },
        });

        if (cardExists) {
          throw new ConflictException('El número de tarjeta ya está en uso');
        }
      }

      return await this.prisma.card.update({
        where: { id: cardId },
        data: updateCardDto,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la tarjeta');
    }
  }
}
