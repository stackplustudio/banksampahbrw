import { Module } from '@nestjs/common';
import { WasteTypesService } from './waste-types.service';
import { WasteTypesController } from './waste-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WasteTypesController],
  providers: [WasteTypesService],
})
export class WasteTypesModule {}