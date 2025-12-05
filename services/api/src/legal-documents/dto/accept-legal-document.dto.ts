import { IsString, IsInt, IsOptional } from 'class-validator';

export class AcceptLegalDocumentDto {
  @IsString()
  documentId: string;

  @IsInt()
  documentVersion: number;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
