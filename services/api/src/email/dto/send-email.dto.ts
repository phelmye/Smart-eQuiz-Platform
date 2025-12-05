import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email HTML content' })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiPropertyOptional({ description: 'Email plain text content' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Sender email (optional, uses default if not provided)' })
  @IsEmail()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Reply-to email address' })
  @IsEmail()
  @IsOptional()
  replyTo?: string;
}
