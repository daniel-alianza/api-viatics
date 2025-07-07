import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const count = await prisma.role.count();
  if (count === 0) {
    const roles = await prisma.role.createMany({
      data: [
        {
          name: 'Administrador',
        },
        {
          name: 'Lider',
        },
        {
          name: 'Gerente',
        },
        {
          name: 'Colaborador',
        },
      ],
    });

    console.log('Roles creados:', roles);
  } else {
    console.log('Los roles ya existen, no se crean de nuevo.');
  }
}
