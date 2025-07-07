import { main as roleSeed } from './role.seed';
import { main as companySeed } from './company.seed';
import { main as branchSeed } from './branch.seed';
import { main as areaSeed } from './area.seed';
import { main as userSeed } from './users.seed';

export async function main() {
  try {
    // Primero roles
    await roleSeed();

    // Luego compañías
    await companySeed();

    // Después sucursales (depende de compañías)
    await branchSeed();

    // Luego áreas (depende de sucursales)
    await areaSeed();

    // Finalmente usuarios (depende de roles, compañías, sucursales y áreas)
    await userSeed();
  } catch (error) {
    console.error('Error en el seeder:', error);
    throw error;
  }
}

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
