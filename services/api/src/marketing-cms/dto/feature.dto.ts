import { IsString, IsInt, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  icon: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsString()
  createdBy: string;
}

export class UpdateFeatureDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
