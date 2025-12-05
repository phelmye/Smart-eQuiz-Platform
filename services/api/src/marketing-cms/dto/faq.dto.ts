import { IsString, IsInt, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  question: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  answer: string;

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

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  answer?: string;

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
