import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max, IsUrl } from 'class-validator';
import { WebhookEvent } from '@prisma/client';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  events: WebhookEvent[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  retryAttempts?: number = 3;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(60000)
  timeout?: number = 30000;
}
