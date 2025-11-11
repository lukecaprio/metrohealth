import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterPatientDto, RegisterStaffDto, RegisterResponseDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register/patient')
  @HttpCode(HttpStatus.CREATED)
  async registerPatient(@Body() registerDto: RegisterPatientDto): Promise<RegisterResponseDto> {
    return this.authService.registerPatient(registerDto);
  }

  @Post('register/staff')
  @HttpCode(HttpStatus.CREATED)
  async registerStaff(@Body() registerDto: RegisterStaffDto): Promise<RegisterResponseDto> {
    return this.authService.registerStaff(registerDto);
  }

  @Post('reset-demo')
  @HttpCode(HttpStatus.OK)
  async resetDemo(): Promise<{ message: string }> {
    return this.authService.resetDemoData();
  }
}

