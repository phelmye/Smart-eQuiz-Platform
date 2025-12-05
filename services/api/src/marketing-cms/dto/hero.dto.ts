import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateHeroDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  headline: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  subheadline: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ctaPrimary: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  ctaPrimaryLink: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ctaSecondary?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  ctaSecondaryLink?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsString()
  createdBy: string;
}
