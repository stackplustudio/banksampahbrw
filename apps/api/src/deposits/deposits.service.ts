import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DepositItemDto {
  wasteTypeId: string;
  weight: number;
  subtotal: number;
}

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  async createDeposit(adminId: string, data: any) {
    const { nasabahId, items } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('Minimal harus ada 1 jenis sampah yang disetorkan');
    }

    const totalWeight = items.reduce((sum: number, item: DepositItemDto) => sum + Number(item.weight), 0);
    const totalAmount = items.reduce((sum: number, item: DepositItemDto) => sum + Number(item.subtotal), 0);

    return this.prisma.$transaction(async (tx) => {
      // 1. Buat data transaksi deposit beserta rincian item
      const deposit = await tx.deposit.create({
        data: {
          nasabahId,
          adminId,
          totalWeight,
          totalAmount,
          items: {
            create: items.map((item: DepositItemDto) => ({
              wasteTypeId: item.wasteTypeId,
              weight: Number(item.weight),
              subtotal: Number(item.subtotal),
            })),
          },
        },
        include: {
          nasabah: { select: { id: true, nasabahId: true, name: true } },
          items: {
            include: {
              wasteType: { select: { name: true, pricePerKg: true } }
            }
          }
        },
      });

      // 2. Tambahkan saldo tabungan ke akun nasabah
      await tx.user.update({
        where: { id: nasabahId },
        data: { balance: { increment: totalAmount } },
      });

      // 3. Rekam notifikasi setoran
      const formattedAmount = `+ Rp ${totalAmount.toLocaleString('id-ID')}`;
      try {
        await tx.notification.create({
          data: {
            userId: nasabahId,
            title: 'Setoran',
            message: `Setoran sampah berhasil - ${totalWeight} kg`,
            amount: formattedAmount,
          },
        });
      } catch (err) {
        // Fallback aman jika tabel notification opsional
      }

      return deposit;
    });
  }

  async findAllDeposits() {
    return this.prisma.deposit.findMany({
      include: {
        nasabah: { select: { id: true, nasabahId: true, name: true } },
        items: {
          include: {
            wasteType: { select: { name: true, pricePerKg: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}