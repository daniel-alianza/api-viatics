import { execSync } from 'child_process';

function main() {
  try {
    console.log('Reseteando base de datos...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

    console.log('Creando migraciones...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

    console.log('Iniciando seeders...');
    execSync('ts-node prisma/seeders/main.seeder.ts', { stdio: 'inherit' });

    console.log('¡Inicialización completada!');
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    process.exit(1);
  }
}

main();
