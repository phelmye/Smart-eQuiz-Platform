export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  category: string;
  altText?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
