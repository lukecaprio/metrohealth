import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMessageToPatientDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReplyMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CompleteRequestDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class EscalateAlertDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class AcknowledgeAlertDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

