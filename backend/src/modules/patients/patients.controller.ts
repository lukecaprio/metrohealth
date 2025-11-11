import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateRequestDto, CreateMessageDto, ReplyMessageDto } from './dto/patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  // Dashboard
  @Get('me/dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.patientsService.getDashboard(user.id);
  }

  // Vitals
  @Get('me/vitals-summary')
  async getVitalsSummary(@CurrentUser() user: any) {
    return this.patientsService.getVitalsSummary(user.id);
  }

  // Test Results
  @Get('me/test-results')
  async getTestResults(@CurrentUser() user: any) {
    return this.patientsService.getTestResults(user.id);
  }

  @Get('me/test-results/:id')
  async getTestResultDetail(@CurrentUser() user: any, @Param('id') id: string) {
    return this.patientsService.getTestResultDetail(user.id, id);
  }

  // Appointments
  @Get('me/appointments')
  async getAppointments(@CurrentUser() user: any) {
    return this.patientsService.getAppointments(user.id);
  }

  // Requests
  @Get('me/requests')
  async getRequests(@CurrentUser() user: any) {
    return this.patientsService.getRequests(user.id);
  }

  @Post('me/requests')
  async createRequest(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestDto) {
    return this.patientsService.createRequest(user.id, createRequestDto);
  }

  // Messages
  @Get('me/messages')
  async getMessages(@CurrentUser() user: any) {
    return this.patientsService.getMessages(user.id);
  }

  @Get('me/available-staff')
  async getAvailableStaff(@CurrentUser() user: any) {
    return this.patientsService.getAvailableStaff();
  }

  // Put reply route BEFORE the general messages POST route to avoid route conflicts
  @Post('me/messages/:id/reply')
  async replyToMessage(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
    @Body() replyDto: ReplyMessageDto,
  ) {
    return this.patientsService.replyToMessage(user.id, messageId, replyDto);
  }

  @Post('me/messages')
  async createMessage(@CurrentUser() user: any, @Body() createMessageDto: CreateMessageDto) {
    return this.patientsService.createMessage(user.id, createMessageDto);
  }
}

