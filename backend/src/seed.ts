import 'dotenv/config';
import { PrismaClient, Role, UserStatus, UserType } from '@prisma/client';
import { hashPassword } from './lib/hash.js';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('Admin@12345');

  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
      userType: UserType.INTERNAL,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date()
    }
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
