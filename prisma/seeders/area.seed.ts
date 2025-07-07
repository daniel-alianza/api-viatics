import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const count = await prisma.area.count();
  if (count === 0) {
    const areas = await prisma.area.createMany({
      data: [
        // Atizapan (branchId: 1)
        {
          name: 'Administración',
          branchId: 1,
        },
        {
          name: 'Almacén',
          branchId: 1,
        },
        {
          name: 'Atención a clientes',
          branchId: 1,
        },
        {
          name: 'Auditoría Externa',
          branchId: 1,
        },
        {
          name: 'Auditoría Interna',
          branchId: 1,
        },
        {
          name: 'Calidad',
          branchId: 1,
        },
        {
          name: 'Compras',
          branchId: 1,
        },
        {
          name: 'Ingeniería',
          branchId: 1,
        },
        {
          name: 'Logística',
          branchId: 1,
        },
        {
          name: 'Mantenimiento',
          branchId: 1,
        },
        {
          name: 'Manufactura',
          branchId: 1,
        },
        {
          name: 'Mercadotecnia',
          branchId: 1,
        },
        {
          name: 'Producción',
          branchId: 1,
        },
        {
          name: 'Recursos Humanos',
          branchId: 1,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 1,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 1,
        },
        {
          name: 'Ventas',
          branchId: 1,
        },
        // Culiacan (branchId: 2)
        {
          name: 'Administración',
          branchId: 2,
        },
        {
          name: 'Almacén',
          branchId: 2,
        },
        {
          name: 'Atención a clientes',
          branchId: 2,
        },
        {
          name: 'Auditoría Externa',
          branchId: 2,
        },
        {
          name: 'Auditoría Interna',
          branchId: 2,
        },
        {
          name: 'Calidad',
          branchId: 2,
        },
        {
          name: 'Compras',
          branchId: 2,
        },
        {
          name: 'Ingeniería',
          branchId: 2,
        },
        {
          name: 'Logística',
          branchId: 2,
        },
        {
          name: 'Mantenimiento',
          branchId: 2,
        },
        {
          name: 'Manufactura',
          branchId: 2,
        },
        {
          name: 'Mercadotecnia',
          branchId: 2,
        },
        {
          name: 'Producción',
          branchId: 2,
        },
        {
          name: 'Recursos Humanos',
          branchId: 2,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 2,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 2,
        },
        {
          name: 'Ventas',
          branchId: 2,
        },
        // Hermosillo (branchId: 3)
        {
          name: 'Administración',
          branchId: 3,
        },
        {
          name: 'Almacén',
          branchId: 3,
        },
        {
          name: 'Atención a clientes',
          branchId: 3,
        },
        {
          name: 'Auditoría Externa',
          branchId: 3,
        },
        {
          name: 'Auditoría Interna',
          branchId: 3,
        },
        {
          name: 'Calidad',
          branchId: 3,
        },
        {
          name: 'Compras',
          branchId: 3,
        },
        {
          name: 'Ingeniería',
          branchId: 3,
        },
        {
          name: 'Logística',
          branchId: 3,
        },
        {
          name: 'Mantenimiento',
          branchId: 3,
        },
        {
          name: 'Manufactura',
          branchId: 3,
        },
        {
          name: 'Mercadotecnia',
          branchId: 3,
        },
        {
          name: 'Producción',
          branchId: 3,
        },
        {
          name: 'Recursos Humanos',
          branchId: 3,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 3,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 3,
        },
        {
          name: 'Ventas',
          branchId: 3,
        },
        // La paz (branchId: 4)
        {
          name: 'Administración',
          branchId: 4,
        },
        {
          name: 'Almacén',
          branchId: 4,
        },
        {
          name: 'Atención a clientes',
          branchId: 4,
        },
        {
          name: 'Auditoría Externa',
          branchId: 4,
        },
        {
          name: 'Auditoría Interna',
          branchId: 4,
        },
        {
          name: 'Calidad',
          branchId: 4,
        },
        {
          name: 'Compras',
          branchId: 4,
        },
        {
          name: 'Ingeniería',
          branchId: 4,
        },
        {
          name: 'Logística',
          branchId: 4,
        },
        {
          name: 'Mantenimiento',
          branchId: 4,
        },
        {
          name: 'Manufactura',
          branchId: 4,
        },
        {
          name: 'Mercadotecnia',
          branchId: 4,
        },
        {
          name: 'Producción',
          branchId: 4,
        },
        {
          name: 'Recursos Humanos',
          branchId: 4,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 4,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 4,
        },
        {
          name: 'Ventas',
          branchId: 4,
        },
        // Leon (branchId: 5)
        {
          name: 'Administración',
          branchId: 5,
        },
        {
          name: 'Almacén',
          branchId: 5,
        },
        {
          name: 'Atención a clientes',
          branchId: 5,
        },
        {
          name: 'Auditoría Externa',
          branchId: 5,
        },
        {
          name: 'Auditoría Interna',
          branchId: 5,
        },
        {
          name: 'Calidad',
          branchId: 5,
        },
        {
          name: 'Compras',
          branchId: 5,
        },
        {
          name: 'Ingeniería',
          branchId: 5,
        },
        {
          name: 'Logística',
          branchId: 5,
        },
        {
          name: 'Mantenimiento',
          branchId: 5,
        },
        {
          name: 'Manufactura',
          branchId: 5,
        },
        {
          name: 'Mercadotecnia',
          branchId: 5,
        },
        {
          name: 'Producción',
          branchId: 5,
        },
        {
          name: 'Recursos Humanos',
          branchId: 5,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 5,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 5,
        },
        {
          name: 'Ventas',
          branchId: 5,
        },
        // Merida (branchId: 6)
        {
          name: 'Administración',
          branchId: 6,
        },
        {
          name: 'Almacén',
          branchId: 6,
        },
        {
          name: 'Atención a clientes',
          branchId: 6,
        },
        {
          name: 'Auditoría Externa',
          branchId: 6,
        },
        {
          name: 'Auditoría Interna',
          branchId: 6,
        },
        {
          name: 'Calidad',
          branchId: 6,
        },
        {
          name: 'Compras',
          branchId: 6,
        },
        {
          name: 'Ingeniería',
          branchId: 6,
        },
        {
          name: 'Logística',
          branchId: 6,
        },
        {
          name: 'Mantenimiento',
          branchId: 6,
        },
        {
          name: 'Manufactura',
          branchId: 6,
        },
        {
          name: 'Mercadotecnia',
          branchId: 6,
        },
        {
          name: 'Producción',
          branchId: 6,
        },
        {
          name: 'Recursos Humanos',
          branchId: 6,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 6,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 6,
        },
        {
          name: 'Ventas',
          branchId: 6,
        },
        // Monterrey (branchId: 7)
        {
          name: 'Administración',
          branchId: 7,
        },
        {
          name: 'Almacén',
          branchId: 7,
        },
        {
          name: 'Atención a clientes',
          branchId: 7,
        },
        {
          name: 'Auditoría Externa',
          branchId: 7,
        },
        {
          name: 'Auditoría Interna',
          branchId: 7,
        },
        {
          name: 'Calidad',
          branchId: 7,
        },
        {
          name: 'Compras',
          branchId: 7,
        },
        {
          name: 'Ingeniería',
          branchId: 7,
        },
        {
          name: 'Logística',
          branchId: 7,
        },
        {
          name: 'Mantenimiento',
          branchId: 7,
        },
        {
          name: 'Manufactura',
          branchId: 7,
        },
        {
          name: 'Mercadotecnia',
          branchId: 7,
        },
        {
          name: 'Producción',
          branchId: 7,
        },
        {
          name: 'Recursos Humanos',
          branchId: 7,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 7,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 7,
        },
        {
          name: 'Ventas',
          branchId: 7,
        },
        // Puebla (branchId: 8)
        {
          name: 'Administración',
          branchId: 8,
        },
        {
          name: 'Almacén',
          branchId: 8,
        },
        {
          name: 'Atención a clientes',
          branchId: 8,
        },
        {
          name: 'Auditoría Externa',
          branchId: 8,
        },
        {
          name: 'Auditoría Interna',
          branchId: 8,
        },
        {
          name: 'Calidad',
          branchId: 8,
        },
        {
          name: 'Compras',
          branchId: 8,
        },
        {
          name: 'Ingeniería',
          branchId: 8,
        },
        {
          name: 'Logística',
          branchId: 8,
        },
        {
          name: 'Mantenimiento',
          branchId: 8,
        },
        {
          name: 'Manufactura',
          branchId: 8,
        },
        {
          name: 'Mercadotecnia',
          branchId: 8,
        },
        {
          name: 'Producción',
          branchId: 8,
        },
        {
          name: 'Recursos Humanos',
          branchId: 8,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 8,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 8,
        },
        {
          name: 'Ventas',
          branchId: 8,
        },
        // Queretaro (branchId: 9)
        {
          name: 'Administración',
          branchId: 9,
        },
        {
          name: 'Almacén',
          branchId: 9,
        },
        {
          name: 'Atención a clientes',
          branchId: 9,
        },
        {
          name: 'Auditoría Externa',
          branchId: 9,
        },
        {
          name: 'Auditoría Interna',
          branchId: 9,
        },
        {
          name: 'Calidad',
          branchId: 9,
        },
        {
          name: 'Compras',
          branchId: 9,
        },
        {
          name: 'Ingeniería',
          branchId: 9,
        },
        {
          name: 'Logística',
          branchId: 9,
        },
        {
          name: 'Mantenimiento',
          branchId: 9,
        },
        {
          name: 'Manufactura',
          branchId: 9,
        },
        {
          name: 'Mercadotecnia',
          branchId: 9,
        },
        {
          name: 'Producción',
          branchId: 9,
        },
        {
          name: 'Recursos Humanos',
          branchId: 9,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 9,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 9,
        },
        {
          name: 'Ventas',
          branchId: 9,
        },
        // San Luis Potosi (branchId: 10)
        {
          name: 'Administración',
          branchId: 10,
        },
        {
          name: 'Almacén',
          branchId: 10,
        },
        {
          name: 'Atención a clientes',
          branchId: 10,
        },
        {
          name: 'Auditoría Externa',
          branchId: 10,
        },
        {
          name: 'Auditoría Interna',
          branchId: 10,
        },
        {
          name: 'Calidad',
          branchId: 10,
        },
        {
          name: 'Compras',
          branchId: 10,
        },
        {
          name: 'Ingeniería',
          branchId: 10,
        },
        {
          name: 'Logística',
          branchId: 10,
        },
        {
          name: 'Mantenimiento',
          branchId: 10,
        },
        {
          name: 'Manufactura',
          branchId: 10,
        },
        {
          name: 'Mercadotecnia',
          branchId: 10,
        },
        {
          name: 'Producción',
          branchId: 10,
        },
        {
          name: 'Recursos Humanos',
          branchId: 10,
        },
        {
          name: 'Seguridad e Higiene',
          branchId: 10,
        },
        {
          name: 'Tecnologías de la Información',
          branchId: 10,
        },
        {
          name: 'Ventas',
          branchId: 10,
        },
      ],
    });
    console.log('Áreas creadas:', areas);
  } else {
    console.log('Las áreas ya existen, no se crean de nuevo.');
  }
}
