// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module'; 
import { DepositsModule } from './deposits/deposits.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { WasteTypesModule } from './waste-types/waste-types.module';
import { NasabahModule } from './nasabah/nasabah.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, 
    PrismaModule, 
    UsersModule,
    DepositsModule,
    DashboardModule,
    WithdrawalsModule,
    WasteTypesModule,
    NasabahModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}