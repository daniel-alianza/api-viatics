import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, User, Card, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCardDto } from './dto/card.dto';
import { UserWithMessage, CardWithMessage } from './dto/types.dto';
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

  async assignCard(id: number, cardNumber: string): Promise<UserWithMessage> {
    try {
      // Validación del número de tarjeta
      if (!cardNumber || cardNumber.trim().length === 0) {
        throw new BadRequestException(
          'El número de tarjeta es requerido. ' +
            'Por favor, proporcione un número de tarjeta válido.',
        );
      }

      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
        include: {
          cards: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `No se puede asignar la tarjeta porque el usuario con ID ${id} no existe. ` +
            'Por favor, verifique que el usuario esté registrado en el sistema.',
        );
      }

      // Verificar si el usuario ya tiene el máximo de tarjetas permitidas (3)
      if (existingUser.cards.length >= 3) {
        throw new BadRequestException(
          `El usuario ya tiene el máximo de tarjetas permitidas (3). ` +
            'No se pueden asignar más tarjetas a este usuario.',
        );
      }

      // Verificar si la tarjeta ya existe
      const existingCard = await this.prisma.card.findUnique({
        where: { cardNumber },
      });

      if (existingCard) {
        throw new ConflictException(
          `El número de tarjeta ${cardNumber} ya está asignado a otro usuario. ` +
            'Por favor, utilice un número de tarjeta diferente.',
        );
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          cards: {
            create: {
              cardNumber,
              isActive: true,
              limite: 0.01, // Límite por defecto
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

      return {
        ...updatedUser,
        message: 'Tarjeta asignada exitosamente al usuario',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al asignar la tarjeta. ' +
          'Por favor, intente nuevamente o contacte al administrador del sistema si el problema persiste.',
      );
    }
  }

  async removeCard(cardId: number): Promise<CardWithMessage> {
    try {
      // Verificar si la tarjeta existe
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
        include: {
          user: true,
        },
      });

      if (!existingCard) {
        throw new NotFoundException(
          `No se puede eliminar la tarjeta porque no existe una tarjeta con ID ${cardId}. ` +
            'Por favor, verifique el ID de la tarjeta.',
        );
      }

      // Verificar si la tarjeta está asignada a un usuario
      if (!existingCard.user) {
        throw new BadRequestException(
          `La tarjeta con ID ${cardId} no está asignada a ningún usuario. ` +
            'No es necesario eliminarla.',
        );
      }

      const deletedCard = await this.prisma.card.delete({
        where: { id: cardId },
      });

      return {
        ...deletedCard,
        message: 'Tarjeta eliminada exitosamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al eliminar la tarjeta. ' +
          'Por favor, intente nuevamente o contacte al administrador del sistema si el problema persiste.',
      );
    }
  }

  async updateCard(
    cardId: number,
    updateCardDto: UpdateCardDto,
  ): Promise<CardWithMessage> {
    try {
      // Verificar si la tarjeta existe
      const existingCard = await this.prisma.card.findUnique({
        where: { id: cardId },
        include: {
          user: true,
        },
      });

      if (!existingCard) {
        throw new NotFoundException(
          `No se puede actualizar la tarjeta porque no existe una tarjeta con ID ${cardId}. ` +
            'Por favor, verifique el ID de la tarjeta.',
        );
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
          throw new ConflictException(
            `El número de tarjeta ${updateCardDto.cardNumber} ya está en uso. ` +
              'Por favor, utilice un número de tarjeta diferente.',
          );
        }
      }

      // Validar el límite si se proporciona
      if (updateCardDto.limite !== undefined) {
        if (updateCardDto.limite < 0) {
          throw new BadRequestException(
            'El límite de la tarjeta no puede ser negativo. ' +
              'Por favor, proporcione un valor válido.',
          );
        }
      }

      const updatedCard = await this.prisma.card.update({
        where: { id: cardId },
        data: updateCardDto,
      });

      return {
        ...updatedCard,
        message: 'Tarjeta actualizada exitosamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al actualizar la tarjeta. ' +
          'Por favor, intente nuevamente o contacte al administrador del sistema si el problema persiste.',
      );
    }
  }
}
