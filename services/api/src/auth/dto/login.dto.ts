import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@firstbaptist.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Authenticated user information',
    type: Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@firstbaptist.com',
      name: 'John Doe',
      role: 'org_admin',
      tenantId: 'tenant-123',
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
}
