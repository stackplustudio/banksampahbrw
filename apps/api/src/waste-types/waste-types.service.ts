import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KategoriSampah } from '@prisma/client';

@Injectable()
export class WasteTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Ambil data sampah beserta relasi item setorannya untuk dihitung totalnya
    const wastes = await this.prisma.wasteType.findMany({
      include: {
        depositItems: {
          select: { weight: true, subtotal: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return wastes.map(waste => {
      // Pastikan konversi ke Number agar aman dari tipe data desimal/string
      const totalWeight = waste.depositItems.reduce((sum, item) => sum + Number(item.weight), 0);
      const totalAmount = waste.depositItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
      
      const { depositItems, ...rest } = waste;
      return { 
        ...rest, 
        totalWeight: Number(totalWeight.toFixed(2)), // Membulatkan maksimal 2 desimal
        totalAmount 
      };
    });
  }

  create(data: { name: string; category: KategoriSampah; pricePerKg: number }) {
    return this.prisma.wasteType.create({ data });
  }

  update(id: string, data: { name: string; category: KategoriSampah; pricePerKg: number }) {
    return this.prisma.wasteType.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.wasteType.delete({
        where: { id }
      });
    } catch (error) {
      // Mencegah penghapusan jika jenis sampah sudah memiliki riwayat transaksi
      throw new BadRequestException('Tidak bisa menghapus jenis sampah yang sudah memiliki riwayat transaksi.');
    }
  }
}