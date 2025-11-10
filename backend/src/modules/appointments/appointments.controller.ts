import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { BookAppointmentDto } from './dto/appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('availability')
  @Roles(Role.PATIENT, Role.NURSE, Role.PHYSICIAN, Role.ADMIN)
  async getAvailability(
    @Query('staffId') staffId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.appointmentsService.getAvailability(staffId, startDate, endDate);
  }

  @Post('book')
  @Roles(Role.PATIENT)
  async bookAppointment(@CurrentUser() user: any, @Body() bookDto: BookAppointmentDto) {
    return this.appointmentsService.bookAppointment(user.id, bookDto);
  }
}

