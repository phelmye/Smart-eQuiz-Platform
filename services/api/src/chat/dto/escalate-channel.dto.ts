import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EscalateChannelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
