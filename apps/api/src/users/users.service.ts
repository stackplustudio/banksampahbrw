import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // 🔥 TAMBAHKAN BARIS INI
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Cek apakah email sudah dipakai
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar!');
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: createUserDto.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Tambahkan fungsi untuk mengambil 1 user spesifik
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  // Tambahkan fungsi untuk update data
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const dataToUpdate: any = { ...updateUserDto };

    // Jika password diisi baru, hash ulang. Jika kosong, abaikan.
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete dataToUpdate.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true }
    });
  }
}