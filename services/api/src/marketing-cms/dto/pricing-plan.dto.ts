import { IsString, IsNumber, IsEnum, IsArray, IsBoolean, IsOptional, MinLength, MaxLength, Min } from 'class-validator';
import { PricingInterval } from '@prisma/client';

export class CreatePricingPlanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(PricingInterval)
  interval: PricingInterval;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ctaText: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  ctaLink: string;

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsString()
  createdBy: string;
}

export class UpdatePricingPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(PricingInterval)
  interval?: PricingInterval;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  ctaText?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  ctaLink?: string;

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;
}
