import { Category } from '../entities/category.entity';

export class CategoryResponseDto {

  id: string;

  name: string;

  slug: string;

  description?: string;

  imageUrl?: string;

  metaTitle?: string;

  metaDescription?: string;

  isActive: boolean;

  sortOrder: number;

  parentId?: string;

  createdAt: Date;

  updatedAt: Date;

  parent?: CategoryResponseDto;

  children?: CategoryResponseDto[];

  breadcrumb: string[];

  depth: number;

  isRoot: boolean;

  hasChildren: boolean;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;
    this.imageUrl = category.imageUrl;
    this.metaTitle = category.metaTitle;
    this.metaDescription = category.metaDescription;
    this.isActive = category.isActive;
    this.sortOrder = category.sortOrder;
    this.parentId = category.parentId;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.parent = category.parent ? new CategoryResponseDto(category.parent) : undefined;
    this.children = category.children?.map(child => new CategoryResponseDto(child));
    this.breadcrumb = category.getBreadcrumb();
    this.depth = category.getDepth();
    this.isRoot = category.isRoot;
    this.hasChildren = category.hasChildren;
  }
}