import { PrismaClient } from '@prisma/client';
import { main as mainSeeder } from '../../prisma/seeders/main.seeder';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando verificación de datos...');
    await mainSeeder();
    console.log('Proceso completado');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
