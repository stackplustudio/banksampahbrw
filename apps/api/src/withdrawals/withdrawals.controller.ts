import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Request() req: any, @Body() data: { nasabahId: string; amount: number }) {
    return this.withdrawalsService.createWithdrawal(req.user.id, data);
  }

  @Get()
  findAll() {
    return this.withdrawalsService.findAll();
  }
}