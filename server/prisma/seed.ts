import 'dotenv/config';
import { genAccountId } from 'src/modules/user/repositories/account.repository';
import { genUserId } from 'src/modules/user/repositories/user.repository';
import { genRoleId } from 'src/modules/user/repositories/role.repository';
import { genUserRoleId } from 'src/modules/user/repositories/user-role.repository';
import { HashService } from 'src/services/cipher/hash.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { Role } from '@prisma/client';

const prisma = new PrismaService();

// Default roles with permissions for store/POS management
const defaultRoles = [
  {
    slug: 'superadmin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    is_system: true,
    permissions: [
      'users.list',
      'users.create',
      'users.update',
      'users.delete',
      'users.roles.list',
      'users.roles.assign',
      'users.roles.remove',
      'roles.list',
      'roles.create',
      'roles.update',
      'roles.delete',
    ],
  },
];

async function seedRoles() {
  console.log('Seeding roles...');
  const createdRoles: Role[] = [];

  for (const roleData of defaultRoles) {
    // Check if role already exists
    let role = await prisma.role.findUnique({
      where: { slug: roleData.slug },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          id: genRoleId(),
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          is_system: roleData.is_system,
          permissions: roleData.permissions,
          active: true,
        },
      });
      console.log(`  Created role: ${roleData.name}`);
    } else {
      console.log(`  Role already exists: ${roleData.name}`);
    }

    createdRoles.push(role);
  }

  return createdRoles;
}

async function seedSuperadmin(superadminRoleId: string) {
  console.log('Seeding superadmin user...');

  // Check if superadmin already exists
  const existing = await prisma.user.findFirst({
    where: { email: 'admin@example.com' },
  });

  if (existing) {
    console.log('  Superadmin user already exists');

    // Ensure superadmin has superadmin role
    const hasRole = await prisma.userRole.findUnique({
      where: {
        unique_user_role: {
          user_id: existing.id,
          role_id: superadminRoleId,
        },
      },
    });

    if (!hasRole) {
      await prisma.userRole.create({
        data: {
          id: genUserRoleId(),
          user_id: existing.id,
          role_id: superadminRoleId,
        },
      });
      console.log('  Assigned superadmin role to existing user');
    }

    return existing;
  }

  // Create new superadmin user
  const passwordService = new HashService('password');
  const userId = genUserId();

  const user = await prisma.user.create({
    data: {
      id: userId,
      email: 'admin@example.com',
      name: 'Super Admin',
      callname: 'Admin',
      email_verified: true,
      accounts: {
        create: [
          {
            id: genAccountId(),
            account_id: userId,
            provider_id: 'password',
            password: await passwordService.hash('Admin123'),
          },
        ],
      },
      userRoles: {
        create: [
          {
            id: genUserRoleId(),
            role_id: superadminRoleId,
          },
        ],
      },
    },
  });

  console.log('  Created superadmin user');
  console.log('  Email: admin@example.com');
  console.log('  Password: Admin123');
  return user;
}

async function main() {
  console.log('Starting database seeding...');

  // Seed roles
  const roles = await seedRoles();

  // Get superadmin role
  const superadminRole = roles.find((r) => r.slug === 'superadmin');
  if (!superadminRole) {
    throw new Error('Superadmin role not found');
  }

  // Seed superadmin user
  await seedSuperadmin(superadminRole.id);

  console.log('\nDatabase seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
