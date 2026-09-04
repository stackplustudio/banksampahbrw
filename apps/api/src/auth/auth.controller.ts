import { Controller, Post, Body, UnauthorizedException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    // 1. Cek kredensial via Service
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Email atau Password salah');
    }

    // 2. Jika valid, buat token
    const tokens = await this.authService.login(user);

    // 3. Simpan Refresh Token ke HTTP-Only Cookie (sangat aman)
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true di production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // 4. Kembalikan Access Token ke frontend untuk disimpan di memory
    return {
      message: 'Login berhasil',
      user: tokens.user,
      access_token: tokens.access_token, // PERBAIKAN: mengirim format access_token
    };
  }
}