import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';
import { BookAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(staffId?: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Normalize dates to start of day (handle timezone issues)
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    
    // If start is in the past, use today
    if (start < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)) {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }
    
    // Ensure end is at least equal to start
    if (end < start) {
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }

    // Get all staff members (or specific one)
    let staff = await this.prisma.staff.findMany({
      where: staffId ? { id: staffId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    console.log('Availability request:', { staffId, startDate, endDate, staffFound: staff.length, start: start.toISOString(), end: end.toISOString() });

    // If no staff found by staff ID, try finding by user ID (in case frontend sends user ID)
    if (staff.length === 0 && staffId) {
      console.log('No staff found by staffId, trying to find by user ID:', staffId);
      const user = await this.prisma.user.findUnique({
        where: { id: staffId },
        include: {
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });
      
      if (user?.staff) {
        staff = [user.staff];
        console.log('Found staff by user ID:', user.staff.id);
      }
    }

    // For each staff member, generate available slots
    const availability = [];

    if (staff.length === 0) {
      console.log('No staff members found for staffId:', staffId);
      return [];
    }

    for (const staffMember of staff) {
      console.log(`Processing staff member: ${staffMember.user.name} (${staffMember.id})`);
      // Get existing appointments for this staff member
      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          staffId: staffMember.id,
          dateTime: {
            gte: start,
            lte: end,
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      });

      // Generate time slots (9 AM to 5 PM, every 30 minutes)
      const slots = [];
      const dateIterator = new Date(start);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      console.log(`Generating slots from ${dateIterator.toISOString()} to ${end.toISOString()}`);
      
      // Iterate through each day in the range
      let dayCount = 0;
      while (dateIterator <= end) {
        dayCount++;
        const dayOfWeek = dateIterator.getDay(); // 0 = Sunday, 6 = Saturday
        const currentDay = new Date(dateIterator.getFullYear(), dateIterator.getMonth(), dateIterator.getDate());
        const isToday = currentDay.getTime() === today.getTime();
        
        console.log(`Day ${dayCount}: ${dateIterator.toISOString()}, dayOfWeek: ${dayOfWeek}, isToday: ${isToday}`);
        
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Generate slots for this day (9 AM to 5 PM, every 30 minutes)
          for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              const slotTime = new Date(
                dateIterator.getFullYear(),
                dateIterator.getMonth(),
                dateIterator.getDate(),
                hour,
                minute,
                0,
                0
              );

              // For today, only include future slots. For future days, include all slots
              const shouldInclude = !isToday || slotTime > now;
              
              if (shouldInclude) {
                // Check if slot is booked
                const isBooked = existingAppointments.some((apt) => {
                  const aptTime = new Date(apt.dateTime);
                  const timeDiff = Math.abs(aptTime.getTime() - slotTime.getTime());
                  return timeDiff < 30 * 60 * 1000; // 30 minutes
                });

                if (!isBooked) {
                  slots.push({
                    dateTime: slotTime.toISOString(),
                    available: true,
                  });
                }
              }
            }
          }
        }

        // Move to next day
        dateIterator.setDate(dateIterator.getDate() + 1);
      }

      console.log(`Generated ${slots.length} slots for ${staffMember.user.name}`);
      
      // Ensure we have slots - if none generated, it might be a weekend or date range issue
      // For debugging: log if no slots
      if (slots.length === 0) {
        console.log(`No slots generated for ${staffMember.user.name}`, {
          staffId: staffMember.id,
          start: start.toISOString(),
          end: end.toISOString(),
          dayOfWeek: new Date(start).getDay(),
          existingAppointments: existingAppointments.length,
        });
      }

      availability.push({
        staffId: staffMember.id,
        staffName: staffMember.user.name,
        role: staffMember.user.role,
        department: staffMember.department,
        slots: slots, // Return all available slots
      });
    }

    return availability;
  }

  async bookAppointment(userId: string, bookDto: BookAppointmentDto) {
    // Get patient
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify staff exists
    const staff = await this.prisma.staff.findUnique({
      where: { id: bookDto.staffId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Check if slot is available
    const requestedTime = new Date(bookDto.dateTime);
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        staffId: bookDto.staffId,
        dateTime: {
          gte: new Date(requestedTime.getTime() - 30 * 60 * 1000),
          lte: new Date(requestedTime.getTime() + 30 * 60 * 1000),
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is no longer available');
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: user.patient.id,
        staffId: bookDto.staffId,
        dateTime: requestedTime,
        type: bookDto.type,
        notes: bookDto.notes,
        status: 'SCHEDULED',
      },
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

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'BOOK_APPOINTMENT',
        entityType: 'Appointment',
        entityId: appointment.id,
      },
    });

    return {
      id: appointment.id,
      dateTime: appointment.dateTime,
      type: appointment.type,
      status: appointment.status,
      doctor: {
        name: appointment.staff.user.name,
        role: appointment.staff.user.role,
      },
      message: 'Appointment booked successfully',
    };
  }

  async getStaffAppointments(userId: string) {
    // Get staff record
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user?.staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Get appointments for this staff member
    // Use start of today to avoid timezone issues with date comparison
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        staffId: user.staff.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        dateTime: {
          gte: startOfToday, // Only future appointments (from start of today)
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return appointments.map((apt) => ({
      id: apt.id,
      dateTime: apt.dateTime,
      type: apt.type,
      status: apt.status,
      notes: apt.notes,
      patient: apt.patient?.user
        ? {
            id: apt.patient.id,
            name: apt.patient.user.name,
            email: apt.patient.user.email,
            roomNumber: apt.patient.roomNumber || 'N/A',
            status: apt.patient.status,
          }
        : {
            id: apt.patient?.id || 'unknown',
            name: 'Unknown Patient',
            email: 'N/A',
            roomNumber: 'N/A',
            status: 'STABLE',
          },
    }));
  }

  async confirmAppointment(userId: string, appointmentId: string) {
    // Verify staff owns this appointment
    const appointment = await this.verifyStaffOwnsAppointment(userId, appointmentId);

    // Update status to CONFIRMED
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CONFIRM_APPOINTMENT',
        entityType: 'Appointment',
        entityId: appointmentId,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      message: 'Appointment confirmed successfully',
    };
  }

  async cancelAppointment(userId: string, appointmentId: string, reason?: string) {
    // Verify staff owns this appointment
    await this.verifyStaffOwnsAppointment(userId, appointmentId);

    // Update status to CANCELLED
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by staff',
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CANCEL_APPOINTMENT',
        entityType: 'Appointment',
        entityId: appointmentId,
        metadata: reason ? { reason } : undefined,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      message: 'Appointment cancelled successfully',
    };
  }

  async rescheduleAppointment(
    userId: string,
    appointmentId: string,
    newDateTime: string,
  ) {
    // Verify staff owns this appointment
    const appointment = await this.verifyStaffOwnsAppointment(userId, appointmentId);

    const requestedTime = new Date(newDateTime);

    // Check if new slot is available
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        staffId: appointment.staffId,
        dateTime: {
          gte: new Date(requestedTime.getTime() - 30 * 60 * 1000),
          lte: new Date(requestedTime.getTime() + 30 * 60 * 1000),
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        id: { not: appointmentId }, // Exclude current appointment
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('The new time slot is not available');
    }

    // Update appointment
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        dateTime: requestedTime,
        notes: `Rescheduled from ${appointment.dateTime}`,
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'RESCHEDULE_APPOINTMENT',
        entityType: 'Appointment',
        entityId: appointmentId,
        metadata: {
          oldDateTime: appointment.dateTime,
          newDateTime: requestedTime,
        },
      },
    });

    return {
      id: updated.id,
      dateTime: updated.dateTime,
      status: updated.status,
      message: 'Appointment rescheduled successfully',
    };
  }

  private async verifyStaffOwnsAppointment(userId: string, appointmentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });

    if (!user?.staff) {
      throw new NotFoundException('Staff member not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.staffId !== user.staff.id) {
      throw new BadRequestException('You can only manage your own appointments');
    }

    return appointment;
  }
}

