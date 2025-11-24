import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiKeyType } from '@prisma/client';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ApiKeyType)
  @IsOptional()
  type?: ApiKeyType = ApiKeyType.SECRET;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[] = [];

  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  rateLimit?: number = 60;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ipWhitelist?: string[] = [];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
