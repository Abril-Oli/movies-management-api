import dataSource from '../data-source';
import { Role } from '../../roles/entities/role.entity';

async function seedRoles(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.getRepository(Role).upsert(
      [{ name: 'user' }, { name: 'admin' }],
      ['name'],
    );
    console.log('Roles user and admin are ready.');
  } finally {
    await dataSource.destroy();
  }
}

seedRoles().catch((error: unknown) => {
  console.error('Failed to seed roles.', error);
  process.exitCode = 1;
});