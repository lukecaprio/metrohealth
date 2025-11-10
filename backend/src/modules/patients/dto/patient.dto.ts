import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { RequestType } from '@prisma/client';

export class CreateRequestDto {
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  receiverId?: string;
}

export class ReplyMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

