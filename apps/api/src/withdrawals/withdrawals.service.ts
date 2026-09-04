import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async createWithdrawal(adminId: string, data: { nasabahId: string; amount: number }) {
    const { nasabahId, amount } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Cek User dan Saldo
      const user = await tx.user.findUnique({ where: { id: nasabahId } });
      if (!user) throw new NotFoundException('Nasabah tidak ditemukan');
      if (user.balance < amount) throw new BadRequestException('Saldo tidak mencukupi');

      const remainingBalance = user.balance - amount;

      // 2. Potong Saldo Nasabah
      await tx.user.update({
        where: { id: nasabahId },
        data: { balance: remainingBalance },
      });

      // 3. Catat Transaksi Penarikan
      const withdrawal = await tx.withdrawal.create({
        data: {
          nasabahId,
          adminId,
          amount,
          remainingBalance,
        },
        include: { nasabah: { select: { nasabahId: true, name: true } } },
      });

      // 4. Buat Notifikasi
      const formattedAmount = `- Rp ${amount.toLocaleString('id-ID')}`;
      await tx.notification.create({
        data: {
          userId: nasabahId,
          title: 'Penarikan',
          message: 'Penarikan tunai',
          amount: formattedAmount,
        },
      });

      return withdrawal;
    });
  }

  async findAll() {
    return this.prisma.withdrawal.findMany({
      include: { nasabah: { select: { nasabahId: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}