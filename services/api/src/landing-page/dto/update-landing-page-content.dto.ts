import { IsObject, IsOptional, IsDateString } from 'class-validator';

export class UpdateLandingPageContentDto {
  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}
