import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class BookAppointmentDto {
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsDateString()
  @IsNotEmpty()
  dateTime: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryAvailabilityDto {
  @IsString()
  @IsOptional()
  staffId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

