import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordNasabah = await bcrypt.hash('nasabah123', 10);

  // 1. Akun Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@banksampah.com' },
    update: {},
    create: {
      email: 'admin@banksampah.com',
      name: 'Admin Pengelola',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
    },
  });

  // 2. Akun Nasabah (Sesuai dengan Data Desain)
  const nasabah = await prisma.user.upsert({
    where: { email: 'sitiaminah@gmail.com' },
    update: {},
    create: {
      nasabahId: 'BSB-001',
      email: 'sitiaminah@gmail.com',
      name: 'Siti Aminah',
      password: hashedPasswordNasabah,
      phone: '081378347627',
      address: 'Banjarum RT01/RW07',
      role: 'NASABAH',
    },
  });

  // 3. Master Data Jenis Sampah (Harga Hari Ini)
  await prisma.wasteType.createMany({
    data: [
      { name: 'Plastik', category: 'ANORGANIK', pricePerKg: 3500 },
      { name: 'Kardus', category: 'ANORGANIK', pricePerKg: 2000 },
      { name: 'Kertas', category: 'ANORGANIK', pricePerKg: 1500 },
      { name: 'Aluminium', category: 'ANORGANIK', pricePerKg: 12000 },
      { name: 'Kaca', category: 'ANORGANIK', pricePerKg: 500 },
      { name: 'Organik', category: 'ORGANIK', pricePerKg: 800 },
    ],
    skipDuplicates: true,
  });

  console.log('Database Seeding Selesai:');
  console.log({ admin, nasabah });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });