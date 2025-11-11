import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaService } from '../../infra/db/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterPatientDto, RegisterStaffDto, RegisterResponseDto } from './dto/register.dto';
import { Role, PatientStatus } from '@prisma/client';

const execAsync = promisify(exec);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        patient: true,
        staff: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Log the login action
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async registerPatient(registerDto: RegisterPatientDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user and patient
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: Role.PATIENT,
        patient: {
          create: {
            roomNumber: registerDto.roomNumber || 'TBD',
            status: registerDto.status || PatientStatus.STABLE,
            dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
            gender: registerDto.gender || null,
            bloodType: registerDto.bloodType || null,
            allergies: registerDto.allergies || null,
          },
        },
      },
      include: {
        patient: true,
      },
    });

    // Create default patient preferences
    await this.prisma.patientPreference.create({
      data: {
        patientId: user.patient!.id,
        language: 'en',
        notifications: true,
      },
    });

    // Generate initial vitals for the new patient
    // Generate realistic vitals within normal ranges (matching seed data format)
    const generateVitals = () => {
      // Heart rate: 60-100 bpm (normal range)
      const heartRate = Math.floor(Math.random() * 40) + 60;
      
      // Blood pressure: Systolic 110-150, Diastolic 70-100 (matching seed data range)
      const systolic = Math.floor(Math.random() * 40) + 110;
      const diastolic = Math.floor(Math.random() * 30) + 70;
      const bloodPressure = `${systolic}/${diastolic}`;
      
      // Temperature: 97.0-99.0 (matching seed data range)
      const temperature = parseFloat((Math.random() * 2 + 97).toFixed(1));
      
      // Oxygen level: 95-100% (normal range)
      const oxygenLevel = Math.floor(Math.random() * 6) + 95;
      
      // Respiratory rate: 12-20 breaths/min (normal range)
      const respiratoryRate = Math.floor(Math.random() * 9) + 12;
      
      return {
        heartRate,
        bloodPressure,
        temperature,
        oxygenLevel,
        respiratoryRate,
      };
    };

    const vitals = generateVitals();
    
    // Create initial vital reading
    await this.prisma.vital.create({
      data: {
        patientId: user.patient!.id,
        heartRate: vitals.heartRate,
        bloodPressure: vitals.bloodPressure,
        temperature: vitals.temperature,
        oxygenLevel: vitals.oxygenLevel,
        respiratoryRate: vitals.respiratoryRate,
        timestamp: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER_PATIENT',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      message: 'Patient registered successfully',
    };
  }

  async registerStaff(registerDto: RegisterStaffDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user and staff
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role as Role,
        staff: {
          create: {
            department: registerDto.department || 'General',
            shift: registerDto.shift || null,
          },
        },
      },
      include: {
        staff: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER_STAFF',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      message: 'Staff member registered successfully',
    };
  }

  async resetDemoData(): Promise<{ message: string }> {
    try {
      // Delete all data in order (respecting foreign key constraints)
      await this.prisma.auditLog.deleteMany();
      await this.prisma.message.deleteMany();
      await this.prisma.testResult.deleteMany();
      await this.prisma.alert.deleteMany();
      await this.prisma.vital.deleteMany();
      await this.prisma.nonUrgentRequest.deleteMany();
      await this.prisma.appointment.deleteMany();
      await this.prisma.patientPreference.deleteMany();
      await this.prisma.patient.deleteMany();
      await this.prisma.staff.deleteMany();
      await this.prisma.user.deleteMany();

      // Run the seed script
      await execAsync('cd /Users/lukecaprio/Desktop/metrohealth/backend && npx ts-node prisma/seed.ts');

      return { message: 'Demo data has been reset successfully' };
    } catch (error) {
      console.error('Error resetting demo data:', error);
      throw new Error('Failed to reset demo data');
    }
  }
}

