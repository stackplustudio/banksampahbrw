import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Validasi kredensial (Email & Password)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Generate Tokens (Access & Refresh)
  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role // PERBAIKAN: role adalah string, bukan object
    };

    // Access token untuk dikirim ke memory frontend
    const accessToken = this.jwtService.sign(payload);
    
    // Refresh token untuk disimpan di HTTP-Only Cookie (umur 7 hari)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-cahyodev',
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // PERBAIKAN: disesuaikan menjadi string
      },
      access_token: accessToken, // PERBAIKAN: disamakan dengan tarikan Next.js
      refreshToken,
    };
  }
}