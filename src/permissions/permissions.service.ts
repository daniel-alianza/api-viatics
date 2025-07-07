import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './interfaces/permission.interface';

@Injectable()
export class PermissionsService {
  private prisma = new PrismaClient();

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findByUser(userId: number): Promise<Permission[]> {
    return this.prisma.permission.findMany({ where: { userId } });
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    return this.prisma.permission.create({ data: dto });
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<Permission> {
    const exists = await this.prisma.permission.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Permiso no encontrado');
    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  async remove(id: number): Promise<void> {
    const exists = await this.prisma.permission.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Permiso no encontrado');
    await this.prisma.permission.delete({ where: { id } });
  }
}
