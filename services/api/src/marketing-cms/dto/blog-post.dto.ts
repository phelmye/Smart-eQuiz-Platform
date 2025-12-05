import { IsString, IsEnum, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';
import { BlogPostStatus } from '@prisma/client';

export class CreateBlogPostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  author: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsEnum(BlogPostStatus)
  status: BlogPostStatus;

  @IsString()
  createdBy: string;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  author?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;
}
