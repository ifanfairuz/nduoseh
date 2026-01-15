import 'dotenv/config';
import { genAccountId } from 'src/modules/user/repositories/account.repository';
import { genUserId } from 'src/modules/user/repositories/user.repository';
import { HashService } from 'src/services/cipher/hash.service';
import { PrismaService } from 'src/services/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  const passwordService = new HashService('password');
  const userId = genUserId();
  await prisma.user.create({
    data: {
      id: userId,
      email: 'admin@example.com',
      name: 'Admin',
      callname: 'Admin',
      accounts: {
        create: [
          {
            id: genAccountId(),
            account_id: userId,
            provider_id: 'password',
            password: await passwordService.hash('admin'),
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
