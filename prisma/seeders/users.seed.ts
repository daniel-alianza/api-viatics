import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function main() {
  const hashedPassword = await bcrypt.hash('n9zPyJBqCNc', 10);

  // Buscar la sucursal de Atizapan de la compañía Alianza Electrica
  const branch = await prisma.branch.findFirst({
    where: {
      name: 'Atizapan',
      companyId: 1, // O busca la compañía por nombre si no estás seguro del ID
    },
  });

  // Buscar el área de Tecnologías de la Información en esa sucursal
  const area = await prisma.area.findFirst({
    where: {
      name: 'Tecnologías de la Información',
      branchId: branch?.id,
    },
  });

  if (!branch || !area) {
    console.error('No se encontró la sucursal o el área requerida');
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@alianzaelectrica.com' },
  });

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email: 'admin@alianzaelectrica.com',
        name: 'Administrador',
        password: hashedPassword,
        roleId: 1, // Asegúrate que el rol ADMIN tiene id 1, si no, búscalo por nombre
        companyId: 1, // O busca la compañía por nombre si no estás seguro del ID
        branchId: branch.id,
        areaId: area.id,
      },
    });
    console.log('Usuario creado:', user);
  } else {
    console.log('El usuario admin ya existe, no se crea de nuevo.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
