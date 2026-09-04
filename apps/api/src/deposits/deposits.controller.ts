// apps/api/src/deposits/deposits.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Post()
  create(@Request() req: any, @Body() createDepositDto: any) {
    const adminId = req.user.id; 
    return this.depositsService.createDeposit(adminId, createDepositDto);
  }

  @Get()
  findAll() {
    return this.depositsService.findAllDeposits();
  }
}