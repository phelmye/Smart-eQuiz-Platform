import { IsString, IsOptional } from 'class-validator';

export class RevokeApiKeyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
