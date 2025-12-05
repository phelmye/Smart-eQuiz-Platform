import { IsString, IsEnum, IsBoolean, IsDateString, IsOptional, IsInt } from 'class-validator';
import { LegalDocumentType } from '@prisma/client';

export class CreateLegalDocumentDto {
  @IsEnum(LegalDocumentType)
  type: LegalDocumentType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  requiresAcceptance?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}
