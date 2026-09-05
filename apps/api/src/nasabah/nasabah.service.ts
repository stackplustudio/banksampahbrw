import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NasabahService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, nasabahId: true, balance: true }
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const setoranAgg = await this.prisma.deposit.aggregate({
      where: { nasabahId: userId },
      _sum: { totalWeight: true, totalAmount: true }
    });

    const penarikanAgg = await this.prisma.withdrawal.aggregate({
      where: { nasabahId: userId },
      _sum: { amount: true }
    });

    const wastePrices = await this.prisma.wasteType.findMany({
      select: { id: true, name: true, pricePerKg: true },
      orderBy: { name: 'asc' }
    });

    return {
      user,
      summary: {
        totalSetoranKg: setoranAgg._sum.totalWeight || 0,
        totalSetoranRp: setoranAgg._sum.totalAmount || 0,
        totalPenarikanRp: penarikanAgg._sum.amount || 0,
      },
      prices: wastePrices
    };
  }

  async getHistory(userId: string) {
    // Ambil data menggunakan Promise.all untuk eksekusi yang lebih cepat & paralel
    const [deposits, withdrawals] = await Promise.all([
      this.prisma.deposit.findMany({
        where: { nasabahId: userId },
        include: { items: { include: { wasteType: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.withdrawal.findMany({
        where: { nasabahId: userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Format Data Transaksi
    const formattedDeposits = deposits.map(d => ({
      id: d.id,
      type: 'SETORAN',
      date: d.createdAt,
      nominal: d.totalAmount,
      items: d.items.map(i => ({ name: i.wasteType.name, weight: i.weight }))
    }));

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w.id,
      type: 'PENARIKAN',
      date: w.createdAt,
      nominal: w.amount,
      items: [{ name: 'Penarikan tunai', weight: 0 }]
    }));

    // Gabungkan dan urutkan kembali untuk memastikan sorting absolut berdasarkan waktu terbaru
    return [...formattedDeposits, ...formattedWithdrawals].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateProfile(userId: string, data: { phone: string; address: string }) {
    // Memastikan record user masih ada sebelum melakukan update
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User tidak valid');

    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        phone: data.phone || null, 
        address: data.address || null 
      },
      select: { id: true, phone: true, address: true }
    });
  }
}