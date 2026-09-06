import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NasabahService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        name: true, 
        nasabahId: true, 
        balance: true, 
        status: true, 
        avatar: true // <-- WAJIB DITAMBAHKAN DI SINI
      }
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');
    
    // TAMBAHKAN BARIS INI: Jika status nonaktif, lempar error 401
    if (user.status === 'NONAKTIF') {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan.');
    }

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

    const formattedDeposits = deposits.map(d => ({
      id: d.id,
      type: 'SETORAN',
      date: d.createdAt,
      nominal: d.totalAmount,
      items: d.items.map(i => ({ 
        name: i.wasteType.name, 
        weight: i.weight,
        subtotal: i.subtotal
      }))
    }));

    const formattedWithdrawals = withdrawals.map(w => ({
      id: w.id,
      type: 'PENARIKAN',
      date: w.createdAt,
      nominal: w.amount,
      items: [{ name: 'Penarikan tunai', weight: 0 }]
    }));

    return [...formattedDeposits, ...formattedWithdrawals].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // --- PERBAIKAN: Fungsi getProfile ditambahkan ---
  // ... fungsi getDashboard dan getHistory biarkan saja

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nasabahId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true // WAJIB DITAMBAHKAN AGAR GAMBAR MUNCUL DI FRONTEND
      }
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');
    return { user };
  }

  async updateProfile(userId: string, data: { phone: string; address: string; avatar?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User tidak valid');

    const updateData: any = {
      phone: data.phone || null, 
      address: data.address || null 
    };

    // Jika ada kiriman avatar (Base64 string), masukkan ke data update
    if (data.avatar) {
      updateData.avatar = data.avatar;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, phone: true, address: true, avatar: true }
    });
  }
}