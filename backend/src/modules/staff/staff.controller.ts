import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import {
  CreateMessageToPatientDto,
  ReplyMessageDto,
  CompleteRequestDto,
  EscalateAlertDto,
  AcknowledgeAlertDto,
} from './dto/staff.dto';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.NURSE, Role.PHYSICIAN, Role.ADMIN)
export class StaffController {
  constructor(
    private staffService: StaffService,
    private appointmentsService: AppointmentsService,
  ) {}

  // Dashboard
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.staffService.getDashboard(user.id);
  }

  // Patient List
  @Get('patients')
  async getPatients() {
    return this.staffService.getPatients();
  }

  @Get('patients/:patientId')
  async getPatientDetail(@Param('patientId') patientId: string) {
    return this.staffService.getPatientDetail(patientId);
  }

  @Get('patients/:patientId/vitals-summary')
  async getPatientVitals(@Param('patientId') patientId: string) {
    return this.staffService.getPatientVitals(patientId);
  }

  // Alerts
  @Get('alerts')
  async getAlerts(@Query('status') status?: string) {
    return this.staffService.getAlerts(status);
  }

  @Get('alerts/:id')
  async getAlertDetail(@Param('id') alertId: string) {
    return this.staffService.getAlertDetail(alertId);
  }

  @Post('alerts/:id/escalate')
  async escalateAlert(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
    @Body() escalateDto: EscalateAlertDto,
  ) {
    return this.staffService.escalateAlert(user.id, alertId, escalateDto);
  }

  @Post('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
  ) {
    return this.staffService.acknowledgeAlert(user.id, alertId, acknowledgeDto);
  }

  // Requests
  @Get('requests')
  async getRequests(@Query('status') status?: string) {
    return this.staffService.getRequests(status);
  }

  @Post('requests/:id/complete')
  async completeRequest(
    @CurrentUser() user: any,
    @Param('id') requestId: string,
    @Body() completeDto: CompleteRequestDto,
  ) {
    return this.staffService.completeRequest(user.id, requestId, completeDto);
  }

  // Messages
  @Get('messages')
  async getMessages(@CurrentUser() user: any) {
    return this.staffService.getMessages(user.id);
  }

  @Post('messages/:patientId')
  async sendMessageToPatient(
    @CurrentUser() user: any,
    @Param('patientId') patientId: string,
    @Body() messageDto: CreateMessageToPatientDto,
  ) {
    return this.staffService.sendMessageToPatient(user.id, patientId, messageDto);
  }

  @Post('messages/:id/reply')
  async replyToMessage(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
    @Body() replyDto: ReplyMessageDto,
  ) {
    return this.staffService.replyToMessage(user.id, messageId, replyDto);
  }

  // Appointments
  @Get('appointments')
  async getMyAppointments(@CurrentUser() user: any) {
    return this.appointmentsService.getStaffAppointments(user.id);
  }

  @Post('appointments/:id/confirm')
  async confirmAppointment(
    @CurrentUser() user: any,
    @Param('id') appointmentId: string,
  ) {
    return this.appointmentsService.confirmAppointment(user.id, appointmentId);
  }

  @Post('appointments/:id/cancel')
  async cancelAppointment(
    @CurrentUser() user: any,
    @Param('id') appointmentId: string,
    @Body() body: { reason?: string },
  ) {
    return this.appointmentsService.cancelAppointment(user.id, appointmentId, body.reason);
  }

  @Post('appointments/:id/reschedule')
  async rescheduleAppointment(
    @CurrentUser() user: any,
    @Param('id') appointmentId: string,
    @Body() body: { newDateTime: string },
  ) {
    return this.appointmentsService.rescheduleAppointment(
      user.id,
      appointmentId,
      body.newDateTime,
    );
  }
}

