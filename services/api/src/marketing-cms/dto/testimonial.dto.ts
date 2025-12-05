import { IsString, IsInt, IsBoolean, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  role: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  organization: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  quote: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsString()
  createdBy: string;
}

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  organization?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  quote?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
