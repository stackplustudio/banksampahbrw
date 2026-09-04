import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role, StatusNasabah } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar!');
    }

    const role = (createUserDto.role as Role) || Role.NASABAH;
    let generatedNasabahId = createUserDto.nasabahId;

    // Logika Auto-Generate ID yang lebih aman menggunakan orderBy descending
    if (role === Role.NASABAH && !generatedNasabahId) {
      const lastNasabah = await this.prisma.user.findFirst({
        where: { role: Role.NASABAH, nasabahId: { not: null } },
        orderBy: { nasabahId: 'desc' },
        select: { nasabahId: true }
      });

      let nextIdNum = 1;
      if (lastNasabah && lastNasabah.nasabahId) {
        const num = parseInt(lastNasabah.nasabahId.replace('BSB-', ''), 10);
        if (!isNaN(num)) {
          nextIdNum = num + 1;
        }
      }
      
      generatedNasabahId = `BSB-${String(nextIdNum).padStart(3, '0')}`;
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: role,
        nasabahId: generatedNasabahId,
        phone: createUserDto.phone || null,
        address: createUserDto.address || null,
      },
      select: { id: true, nasabahId: true, email: true, name: true, role: true }
    });
  }

  async findAll() {
    // Ambil data User beserta agregasi transaksinya
    const users = await this.prisma.user.findMany({
      where: { role: 'NASABAH' },
      select: {
        id: true,
        nasabahId: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        status: true,
        balance: true,
        createdAt: true,
        deposits: {
          select: { totalWeight: true, totalAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Kalkulasi Total Berat dan Total Harga per nasabah
    return users.map(user => {
      const totalSetoranKg = user.deposits.reduce((sum, d) => sum + d.totalWeight, 0);
      const totalHargaRp = user.deposits.reduce((sum, d) => sum + d.totalAmount, 0);
      
      const { deposits, ...userData } = user;
      return {
        ...userData,
        totalSetoranKg,
        totalHargaRp
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nasabahId: true, name: true, email: true, phone: true, address: true, status: true }
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete dataToUpdate.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, nasabahId: true, email: true, name: true, status: true }
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, name: true }
    });
  }
}