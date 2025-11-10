import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';
import { CreateRequestDto, CreateMessageDto, ReplyMessageDto } from './dto/patient.dto';
import { Role } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  // ==================== DASHBOARD ====================
  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const patientId = user.patient.id;

    // Get latest vitals
    const latestVital = await this.prisma.vital.findFirst({
      where: { patientId },
      orderBy: { timestamp: 'desc' },
    });

    // Get next appointment
    const nextAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        dateTime: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      orderBy: { dateTime: 'asc' },
      include: {
        staff: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Count unread messages
    const unreadMessagesCount = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    // Count abnormal test results
    const abnormalTestResultsCount = await this.prisma.testResult.count({
      where: {
        patientId,
        status: { in: ['ABNORMAL', 'CRITICAL'] },
      },
    });

    // Get active requests
    const activeRequests = await this.prisma.nonUrgentRequest.findMany({
      where: {
        patientId,
        status: { in: ['QUEUED', 'IN_PROGRESS'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      welcome: `Welcome, ${user.name}`,
      patient: {
        name: user.name,
        roomNumber: user.patient.roomNumber,
        status: user.patient.status,
      },
      vitals: latestVital
        ? {
            heartRate: latestVital.heartRate,
            bloodPressure: latestVital.bloodPressure,
            temperature: latestVital.temperature,
            oxygenLevel: latestVital.oxygenLevel,
            timestamp: latestVital.timestamp,
          }
        : null,
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            dateTime: nextAppointment.dateTime,
            type: nextAppointment.type,
            doctorName: nextAppointment.staff.user.name,
            status: nextAppointment.status,
          }
        : null,
      counts: {
        unreadMessages: unreadMessagesCount,
        abnormalTestResults: abnormalTestResultsCount,
        activeRequests: activeRequests.length,
      },
      recentRequests: activeRequests,
    };
  }

  // ==================== VITALS ====================
  async getVitalsSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const vitals = await this.prisma.vital.findMany({
      where: { patientId: user.patient.id },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return {
      patientId: user.patient.id,
      roomNumber: user.patient.roomNumber,
      vitals,
    };
  }

  // ==================== TEST RESULTS ====================
  async getTestResults(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const testResults = await this.prisma.testResult.findMany({
      where: { patientId: user.patient.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        summary: true,
      },
    });

    return testResults;
  }

  async getTestResultDetail(userId: string, testResultId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const testResult = await this.prisma.testResult.findUnique({
      where: { id: testResultId },
    });

    if (!testResult) {
      throw new NotFoundException('Test result not found');
    }

    if (testResult.patientId !== user.patient.id) {
      throw new ForbiddenException('Access denied');
    }

    return testResult;
  }

  // ==================== APPOINTMENTS ====================
  async getAppointments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { patientId: user.patient.id },
      orderBy: { dateTime: 'desc' },
      include: {
        staff: {
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
        },
      },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      dateTime: apt.dateTime,
      duration: apt.duration,
      type: apt.type,
      status: apt.status,
      notes: apt.notes,
      doctor: {
        name: apt.staff.user.name,
        role: apt.staff.user.role,
        department: apt.staff.department,
      },
    }));
  }

  // ==================== HELP REQUESTS ====================
  async getRequests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const requests = await this.prisma.nonUrgentRequest.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  async createRequest(userId: string, createRequestDto: CreateRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    const request = await this.prisma.nonUrgentRequest.create({
      data: {
        patientId: user.patient.id,
        type: createRequestDto.type,
        notes: createRequestDto.notes,
        status: 'QUEUED',
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_REQUEST',
        entityType: 'NonUrgentRequest',
        entityId: request.id,
        metadata: { type: createRequestDto.type },
      },
    });

    return request;
  }

  // ==================== MESSAGES ====================
  async getMessages(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return messages;
  }

  async getAvailableStaff() {
    const staff = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.NURSE, Role.PHYSICIAN] },
      },
      select: {
        id: true, // User ID
        name: true,
        email: true,
        role: true,
        staff: {
          select: {
            id: true, // Staff ID - this is what we need for appointments
            department: true,
            shift: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Physicians first, then nurses
        { name: 'asc' },
      ],
    });

    // Map to include staffId for easier frontend use
    return staff.map((user) => ({
      id: user.staff?.id || user.id, // Use staff ID if available, fallback to user ID
      userId: user.id, // Keep user ID for reference
      name: user.name,
      email: user.email,
      role: user.role,
      staff: user.staff,
    }));
  }

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    // If no specific receiver, send to first available staff
    let receiverId = createMessageDto.receiverId;

    if (!receiverId) {
      const staff = await this.prisma.user.findFirst({
        where: {
          role: { in: [Role.NURSE, Role.PHYSICIAN, Role.ADMIN] },
        },
      });

      if (!staff) {
        throw new NotFoundException('No staff available to receive messages');
      }

      receiverId = staff.id;
    }

    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        subject: createMessageDto.subject,
        content: createMessageDto.content,
        threadId: null,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SEND_MESSAGE',
        entityType: 'Message',
        entityId: message.id,
      },
    });

    return message;
  }

  async replyToMessage(userId: string, messageId: string, replyDto: ReplyMessageDto) {
    const originalMessage = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      throw new NotFoundException('Message not found');
    }

    if (originalMessage.receiverId !== userId && originalMessage.senderId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Reply goes to the sender of the original message
    const receiverId =
      originalMessage.senderId === userId ? originalMessage.receiverId : originalMessage.senderId;

    const threadId = originalMessage.threadId || originalMessage.id;

    const reply = await this.prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        subject: originalMessage.subject,
        content: replyDto.content,
        threadId,
      },
    });

    return reply;
  }
}

