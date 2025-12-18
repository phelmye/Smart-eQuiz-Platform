import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'First Baptist Church',
    description: 'Organization/tenant name'
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ 
    example: 'firstbaptist',
    description: 'Subdomain for tenant (will be {subdomain}.smartequiz.com)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
  })
  @MinLength(3)
  subdomain: string;

  @ApiProperty({ 
    example: 'John',
    description: 'Admin user first name'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'Admin user last name'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    example: 'john@firstbaptist.org',
    description: 'Admin user email address'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'Password (min 8 characters)'
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: '+1234567890',
    description: 'Admin phone number (optional)',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    example: 'professional',
    description: 'Selected plan ID (starter, professional, enterprise)',
    required: false,
    default: 'professional'
  })
  @IsString()
  @IsOptional()
  plan?: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'abc123' })
  tenantId: string;

  @ApiProperty({ example: 'user456' })
  userId: string;

  @ApiProperty({ example: 'firstbaptist' })
  subdomain: string;

  @ApiProperty({ example: 'https://firstbaptist.smartequiz.com' })
  tenantUrl: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
