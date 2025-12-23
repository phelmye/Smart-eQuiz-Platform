import { IsString, IsOptional, IsEmail, IsEnum, IsNumber, Min } from 'class-validator';

export enum TenantStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStorage?: number;
}
