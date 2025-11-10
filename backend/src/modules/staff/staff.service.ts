import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';
import {
  CreateMessageToPatientDto,
  ReplyMessageDto,
  CompleteRequestDto,
  EscalateAlertDto,
  AcknowledgeAlertDto,
} from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  // ==================== DASHBOARD ====================
  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user?.staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Get active alerts summary
    const activeAlerts = await this.prisma.alert.findMany({
      where: {
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      include: {
        patient: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Count alerts by severity
    const alertCounts = {
      critical: await this.prisma.alert.count({
        where: { severity: 'CRITICAL', status: 'ACTIVE' },
      }),
      high: await this.prisma.alert.count({
        where: { severity: 'HIGH', status: 'ACTIVE' },
      }),
      medium: await this.prisma.alert.count({
        where: { severity: 'MEDIUM', status: 'ACTIVE' },
      }),
      low: await this.prisma.alert.count({
        where: { severity: 'LOW', status: 'ACTIVE' },
      }),
    };

    // Get patient count
    const patientCount = await this.prisma.patient.count({
      where: { status: { in: ['ADMITTED', 'STABLE', 'CRITICAL', 'RECOVERING'] } },
    });

    // Get active requests summary
    const activeRequests = await this.prisma.nonUrgentRequest.findMany({
      where: {
        status: { in: ['QUEUED', 'IN_PROGRESS'] },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      include: {
        patient: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    const requestCounts = {
      queued: await this.prisma.nonUrgentRequest.count({
        where: { status: 'QUEUED' },
      }),
      inProgress: await this.prisma.nonUrgentRequest.count({
        where: { status: 'IN_PROGRESS' },
      }),
    };

    // Get unread messages count
    const unreadMessagesCount = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return {
      staffMember: {
        name: user.name,
        role: user.role,
        department: user.staff.department,
        shift: user.staff.shift,
      },
      summary: {
        totalPatients: patientCount,
        activeAlerts: alertCounts.critical + alertCounts.high + alertCounts.medium + alertCounts.low,
        criticalAlerts: alertCounts.critical,
        activeRequests: requestCounts.queued + requestCounts.inProgress,
        unreadMessages: unreadMessagesCount,
      },
      alerts: {
        counts: alertCounts,
        recent: activeAlerts.map((alert) => ({
          id: alert.id,
          severity: alert.severity,
          status: alert.status,
          reason: alert.reason,
          patientName: alert.patient.user.name,
          roomNumber: alert.patient.roomNumber,
          createdAt: alert.createdAt,
        })),
      },
      requests: {
        counts: requestCounts,
        recent: activeRequests.map((req) => ({
          id: req.id,
          type: req.type,
          status: req.status,
          patientName: req.patient.user.name,
          roomNumber: req.patient.roomNumber,
          createdAt: req.createdAt,
        })),
      },
    };
  }

  // ==================== PATIENT LIST ====================
  async getPatients() {
    const patients = await this.prisma.patient.findMany({
      where: {
        status: { in: ['ADMITTED', 'STABLE', 'CRITICAL', 'RECOVERING'] },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        vitals: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return patients.map((patient) => ({
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      roomNumber: patient.roomNumber,
      status: patient.status,
      latestVitals: patient.vitals[0] || null,
    }));
  }

  async getPatientDetail(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
        vitals: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        nonUrgentRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        testResults: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        appointments: {
          orderBy: { dateTime: 'desc' },
          take: 5,
          include: {
            staff: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      roomNumber: patient.roomNumber,
      status: patient.status,
      demographics: {
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        allergies: patient.allergies,
      },
      admittedAt: patient.user.createdAt,
      vitals: patient.vitals,
      recentAlerts: patient.alerts,
      recentRequests: patient.nonUrgentRequests,
      recentTestResults: patient.testResults,
      appointments: patient.appointments.map((apt) => ({
        id: apt.id,
        dateTime: apt.dateTime,
        type: apt.type,
        status: apt.status,
        doctorName: apt.staff.user.name,
      })),
    };
  }

  async getPatientVitals(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const vitals = await this.prisma.vital.findMany({
      where: { patientId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return {
      patientId,
      patientName: patient.user.name,
      roomNumber: patient.roomNumber,
      vitals,
    };
  }

  // ==================== ALERTS ====================
  async getAlerts(status?: string) {
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = { in: ['ACTIVE', 'ACKNOWLEDGED', 'ESCALATED'] };
    }

    const alerts = await this.prisma.alert.findMany({
      where: whereClause,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      include: {
        patient: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      severity: alert.severity,
      status: alert.status,
      reason: alert.reason,
      patient: {
        id: alert.patient.id,
        name: alert.patient.user.name,
        roomNumber: alert.patient.roomNumber,
      },
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }));
  }

  async getAlertDetail(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            vitals: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return {
      id: alert.id,
      severity: alert.severity,
      status: alert.status,
      reason: alert.reason,
      vitalsSnapshot: alert.vitalsSnapshot,
      acknowledgedBy: alert.acknowledgedBy,
      escalatedBy: alert.escalatedBy,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      patient: {
        id: alert.patient.id,
        name: alert.patient.user.name,
        email: alert.patient.user.email,
        roomNumber: alert.patient.roomNumber,
        status: alert.patient.status,
        currentVitals: alert.patient.vitals[0] || null,
      },
    };
  }

  async escalateAlert(userId: string, alertId: string, escalateDto: EscalateAlertDto) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    const updatedAlert = await this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'ESCALATED',
        escalatedBy: userId,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ESCALATE_ALERT',
        entityType: 'Alert',
        entityId: alertId,
        metadata: { reason: escalateDto.reason },
      },
    });

    return updatedAlert;
  }

  async acknowledgeAlert(userId: string, alertId: string, acknowledgeDto: AcknowledgeAlertDto) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    const updatedAlert = await this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        acknowledgedBy: userId,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ACKNOWLEDGE_ALERT',
        entityType: 'Alert',
        entityId: alertId,
        metadata: { notes: acknowledgeDto.notes },
      },
    });

    return updatedAlert;
  }

  // ==================== REQUESTS ====================
  async getRequests(status?: string) {
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = { in: ['QUEUED', 'IN_PROGRESS'] };
    }

    const requests = await this.prisma.nonUrgentRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return requests.map((req) => ({
      id: req.id,
      type: req.type,
      status: req.status,
      notes: req.notes,
      patient: {
        id: req.patient.id,
        name: req.patient.user.name,
        roomNumber: req.patient.roomNumber,
      },
      createdAt: req.createdAt,
      processedAt: req.processedAt,
    }));
  }

  async completeRequest(userId: string, requestId: string, completeDto: CompleteRequestDto) {
    const request = await this.prisma.nonUrgentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const updatedRequest = await this.prisma.nonUrgentRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'COMPLETE_REQUEST',
        entityType: 'NonUrgentRequest',
        entityId: requestId,
        metadata: { notes: completeDto.notes },
      },
    });

    return updatedRequest;
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

  async sendMessageToPatient(
    userId: string,
    patientId: string,
    messageDto: CreateMessageToPatientDto,
  ) {
    // Get patient's user ID
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const message = await this.prisma.message.create({
      data: {
        senderId: userId,
        receiverId: patient.userId,
        subject: messageDto.subject,
        content: messageDto.content,
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

