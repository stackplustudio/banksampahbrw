import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { NasabahService } from './nasabah.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('nasabah')
export class NasabahController {
  constructor(private readonly nasabahService: NasabahService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.nasabahService.getDashboard(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.nasabahService.getHistory(req.user.id);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    // Memanfaatkan dashboard function untuk info dasar
    return this.nasabahService.getDashboard(req.user.id); 
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() data: { phone: string; address: string }) {
    return this.nasabahService.updateProfile(req.user.id, data);
  }
}