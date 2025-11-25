import { IsEnum, IsNotEmpty, IsObject, IsDateString, IsOptional } from 'class-validator';

export enum LandingPageSection {
  HERO = 'HERO',
  STATS = 'STATS',
  FEATURES = 'FEATURES',
  TESTIMONIALS = 'TESTIMONIALS',
  BRANDING = 'BRANDING',
}

export class CreateLandingPageContentDto {
  @IsEnum(LandingPageSection)
  @IsNotEmpty()
  section: LandingPageSection;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;
}
