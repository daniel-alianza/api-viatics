import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        company: true,
        branch: true,
        area: true,
        role: true,
        cards: true,
      },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        branch: true,
        area: true,
        role: true,
        cards: true,
      },
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async assignCard(id: number, cardNumber: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        cards: {
          create: {
            cardNumber,
            isActive: true,
          },
        },
      },
    });
  }
}
