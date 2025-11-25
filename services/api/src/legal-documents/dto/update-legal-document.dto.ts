import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateLegalDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  requiresAcceptance?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}
