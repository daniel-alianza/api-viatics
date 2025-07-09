import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const count = await prisma.company.count();
  if (count === 0) {
    const companies = await prisma.company.createMany({
      data: [
        {
          name: 'Alianza Electrica',
        },
        {
          name: 'FG Electrical',
        },
        {
          name: 'FG Manufacturing',
        },
        {
          name: 'Tableros y Arrancadores',
        },
      ],
    });
    console.log('Compañías creadas:', companies);
  } else {
    console.log('Las compañías ya existen, no se crean de nuevo.');
  }
}
