import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Kita enkripsi password-nya di sini sebelum masuk ke database
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stackplus.studio' },
    update: {
      password: hashedPassword, // Update password lama dengan yang sudah di-hash
    },
    create: {
      email: 'admin@stackplus.studio',
      name: 'Budi Cahyono',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin seeded with hashed password:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });