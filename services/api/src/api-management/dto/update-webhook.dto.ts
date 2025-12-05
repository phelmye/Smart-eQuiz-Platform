import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max, IsUrl } from 'class-validator';
import { WebhookEvent, WebhookStatus } from '@prisma/client';

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events?: WebhookEvent[];

  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  retryAttempts?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(60000)
  timeout?: number;
}
