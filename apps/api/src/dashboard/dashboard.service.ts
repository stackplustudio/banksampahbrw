import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminSummary(startDateStr?: string, endDateStr?: string) {
    // Tentukan range default jika tidak ada parameter (misal: 1 bulan terakhir)
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().setDate(endDate.getDate() - 30));
    startDate.setHours(0, 0, 0, 0);

    const dateFilter = {
      createdAt: { gte: startDate, lte: endDate }
    };

    // 1. Saldo Sistem Saat Ini (Global - Tanpa Filter Tanggal)
    const saldoAgg = await this.prisma.user.aggregate({
      where: { role: 'NASABAH' },
      _sum: { balance: true }
    });

    // 2. Total Nasabah yang melakukan setoran pada range date
    const depositsInRange = await this.prisma.deposit.findMany({
      where: dateFilter,
      select: { nasabahId: true }
    });
    const uniqueNasabahIds = new Set(depositsInRange.map(d => d.nasabahId));
    const totalNasabah = uniqueNasabahIds.size;

    // 3. Agregasi Setoran & Penarikan pada range date
    const setoranAgg = await this.prisma.deposit.aggregate({
      where: dateFilter,
      _sum: { totalWeight: true, totalAmount: true }
    });

    const penarikanAgg = await this.prisma.withdrawal.aggregate({
      where: dateFilter,
      _sum: { amount: true }
    });

    // 4. Data Bar Chart (Setoran Bulanan dalam Range)
    // Untuk Bar chart, kita kelompokkan berdasarkan bulan dari hasil filter
    const depositsForChart = await this.prisma.deposit.findMany({
      where: dateFilter,
      select: { createdAt: true, totalWeight: true },
    });

    const monthlyDataMap = new Map<string, number>();
    depositsForChart.forEach(d => {
      const monthKey = d.createdAt.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + d.totalWeight);
    });
    const monthlyData = Array.from(monthlyDataMap, ([month, weight]) => ({ month, weight }));

    // 5. Data Pie Chart (Komposisi Jenis Sampah dalam Range)
    const depositItemsInRange = await this.prisma.depositItem.findMany({
      where: { deposit: dateFilter },
      include: { wasteType: true }
    });

    const compositionMap = new Map<string, number>();
    depositItemsInRange.forEach(item => {
      const current = compositionMap.get(item.wasteType.name) || 0;
      compositionMap.set(item.wasteType.name, current + item.weight);
    });

    const compositionData = Array.from(compositionMap, ([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight);

    return {
      summary: {
        totalNasabah,
        totalBeratSetoran: setoranAgg._sum.totalWeight || 0,
        totalSaldoSetoran: setoranAgg._sum.totalAmount || 0,
        totalSaldoPenarikan: penarikanAgg._sum.amount || 0,
        saldoSistemSaatIni: saldoAgg._sum.balance || 0,
      },
      chartData: {
        monthly: monthlyData,
        composition: compositionData
      }
    };
  }
}