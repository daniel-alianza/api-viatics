import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const count = await prisma.branch.count();
  if (count === 0) {
    const branches = await prisma.branch.createMany({
      data: [
        // Alianza Electrica (companyId: 1)
        {
          name: 'Atizapan',
          companyId: 1,
        },
        {
          name: 'Culiacan',
          companyId: 1,
        },
        {
          name: 'Hermosillo',
          companyId: 1,
        },
        {
          name: 'La paz',
          companyId: 1,
        },
        {
          name: 'Leon',
          companyId: 1,
        },
        {
          name: 'Merida, Yucatan',
          companyId: 1,
        },
        {
          name: 'Monterrey',
          companyId: 1,
        },
        {
          name: 'Puebla',
          companyId: 1,
        },
        {
          name: 'Queretaro',
          companyId: 1,
        },
        {
          name: 'San Luis Potosi',
          companyId: 1,
        },
        // FG Electrical (companyId: 2)
        {
          name: 'Atizapan',
          companyId: 2,
        },
        {
          name: 'Culiacan',
          companyId: 2,
        },
        {
          name: 'Hermosillo',
          companyId: 2,
        },
        {
          name: 'La paz',
          companyId: 2,
        },
        {
          name: 'Leon',
          companyId: 2,
        },
        {
          name: 'Merida, Yucatan',
          companyId: 2,
        },
        {
          name: 'Monterrey',
          companyId: 2,
        },
        {
          name: 'Puebla',
          companyId: 2,
        },
        {
          name: 'Queretaro',
          companyId: 2,
        },
        {
          name: 'San Luis Potosi',
          companyId: 2,
        },
        // FG Manufacturing (companyId: 3)
        {
          name: 'Atizapan',
          companyId: 3,
        },
        {
          name: 'Culiacan',
          companyId: 3,
        },
        {
          name: 'Hermosillo',
          companyId: 3,
        },
        {
          name: 'La paz',
          companyId: 3,
        },
        {
          name: 'Leon',
          companyId: 3,
        },
        {
          name: 'Merida, Yucatan',
          companyId: 3,
        },
        {
          name: 'Monterrey',
          companyId: 3,
        },
        {
          name: 'Puebla',
          companyId: 3,
        },
        {
          name: 'Queretaro',
          companyId: 3,
        },
        {
          name: 'San Luis Potosi',
          companyId: 3,
        },
        // Tableros y Arrancadores (companyId: 4)
        {
          name: 'Atizapan',
          companyId: 4,
        },
        {
          name: 'Culiacan',
          companyId: 4,
        },
        {
          name: 'Hermosillo',
          companyId: 4,
        },
        {
          name: 'La paz',
          companyId: 4,
        },
        {
          name: 'Leon',
          companyId: 4,
        },
        {
          name: 'Merida, Yucatan',
          companyId: 4,
        },
        {
          name: 'Monterrey',
          companyId: 4,
        },
        {
          name: 'Puebla',
          companyId: 4,
        },
        {
          name: 'Queretaro',
          companyId: 4,
        },
        {
          name: 'San Luis Potosi',
          companyId: 4,
        },
      ],
    });
    console.log('Sucursales creadas:', branches);
  } else {
    console.log('Las sucursales ya existen, no se crean de nuevo.');
  }
}
