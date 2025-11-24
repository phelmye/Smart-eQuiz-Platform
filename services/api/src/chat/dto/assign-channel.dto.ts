import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignChannelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teamMemberId: string;
}
