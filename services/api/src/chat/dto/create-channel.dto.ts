import { IsEnum, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @ApiProperty({ enum: ChannelType })
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contextId?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  priority?: string;
}
