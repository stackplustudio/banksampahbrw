// apps/api/src/deposits/deposits.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Definisikan tipe untuk item agar TypeScript tidak protes
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

    // Berikan tipe :number pada sum dan :DepositItemDto pada item
    const totalWeight = items.reduce((sum: number, item: DepositItemDto) => sum + item.weight, 0);
    const totalAmount = items.reduce((sum: number, item: DepositItemDto) => sum + item.subtotal, 0);

    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data: {
          nasabahId,
          adminId,
          totalWeight,
          totalAmount,
          items: {
            create: items.map((item: DepositItemDto) => ({
              wasteTypeId: item.wasteTypeId,
              weight: item.weight,
              subtotal: item.subtotal,
            })),
          },
        },
        include: { nasabah: true },
      });

      await tx.user.update({
        where: { id: nasabahId },
        data: { balance: { increment: totalAmount } },
      });

      const formattedAmount = `+ Rp ${totalAmount.toLocaleString('id-ID')}`;
      await tx.notification.create({
        data: {
          userId: nasabahId,
          title: 'Setoran',
          message: `Setoran sampah berhasil - ${totalWeight} kg`,
          amount: formattedAmount,
        },
      });

      return deposit;
    });
  }

  async findAllDeposits() {
    return this.prisma.deposit.findMany({
      include: {
        nasabah: { select: { nasabahId: true, name: true } },
        // Tambahkan relasi ini untuk Modal Detail
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