import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { PatientStatus } from '@prisma/client';

export class RegisterPatientDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  allergies?: string;
}

export class RegisterStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['NURSE', 'PHYSICIAN', 'ADMIN'])
  @IsNotEmpty()
  role: 'NURSE' | 'PHYSICIAN' | 'ADMIN';

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  shift?: string;
}

export class RegisterResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  message: string;
}

