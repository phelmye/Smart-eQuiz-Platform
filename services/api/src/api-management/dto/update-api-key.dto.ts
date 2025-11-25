import { IsString, IsOptional, IsArray, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiKeyStatus } from '@prisma/client';

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  rateLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];

  @IsOptional()
  @IsEnum(ApiKeyStatus)
  status?: ApiKeyStatus;
}
