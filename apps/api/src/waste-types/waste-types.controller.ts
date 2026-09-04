import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WasteTypesService } from './waste-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('waste-types')
export class WasteTypesController {
  constructor(private readonly wasteTypesService: WasteTypesService) {}

  @Get()
  findAll() { return this.wasteTypesService.findAll(); }

  @Post()
  create(@Body() data: any) { return this.wasteTypesService.create(data); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.wasteTypesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wasteTypesService.remove(id);
  }
}