import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaService } from '../../infra/db/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

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

