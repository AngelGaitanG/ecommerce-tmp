import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between, MoreThan, LessThan, SelectQueryBuilder, Not } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto
} from '../dto';
import {
  IProductRepository,
  ProductStats,
  ProductsByCategory,
  PaginatedProducts
} from './product-repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}

  // CRUD básico
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...createProductDto,
      slug: await this.generateSlug(createProductDto.name),
      sku: await this.generateSku()
    });

    return await this.productRepo.save(product);
  }

  async findAll(queryDto: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = queryDto;

    const queryBuilder = this.createQueryBuilder('product');
    
    this.applyFilters(queryBuilder, queryDto);
    this.includeRelations(queryBuilder, queryDto);

    // Validar campo de ordenamiento
    const validSortFields = ['name', 'basePrice', 'createdAt', 'updatedAt', 'stockQuantity', 'sortOrder'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    queryBuilder
      .orderBy(`product.${sortField}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findById(id: string, relations: string[] = []): Promise<Product | null> {
    return await this.productRepo.findOne({
      where: { id },
      relations
    });
  }

  async findBySlug(slug: string, relations: string[] = []): Promise<Product | null> {
    return await this.productRepo.findOne({
      where: { slug },
      relations
    });
  }

  async findBySku(sku: string, relations: string[] = []): Promise<Product | null> {
    return await this.productRepo.findOne({
      where: { sku },
      relations
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Update basic fields
    Object.assign(product, updateProductDto);

    // Update slug if name changed
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      product.slug = await this.generateSlug(updateProductDto.name, id);
    }

    await this.productRepo.save(product);
    return product;
  }

  async delete(id: string): Promise<void> {
    await this.softDelete(id);
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.productRepo.softDelete(id);
    if (result.affected === 0) {
      throw new Error(`Product with ID ${id} not found`);
    }
  }

  async restore(id: string): Promise<void> {
    const result = await this.productRepo.restore(id);
    if (result.affected === 0) {
      throw new Error(`Product with ID ${id} not found or not deleted`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variants', 'images']
    });
    
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    // Delete related variants and images
    if (product.variants?.length) {
      await this.variantRepo.remove(product.variants);
    }
    if (product.images?.length) {
      await this.imageRepo.remove(product.images);
    }

    await this.productRepo.remove(product);
  }

  // Búsquedas avanzadas
  async search(query: string, options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const searchOptions = {
      ...options,
      search: query
    };
    return this.findAll(searchOptions);
  }

  async findByCategory(categoryId: string, options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const categoryOptions = {
      ...options,
      categoryId
    };
    return this.findAll(categoryOptions);
  }

  async findByCategories(categoryIds: string[], options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const categoriesOptions = {
      ...options,
      categoryIds
    };
    return this.findAll(categoriesOptions);
  }

  async findByPriceRange(minPrice: number, maxPrice: number, options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const priceOptions = {
      ...options,
      minPrice,
      maxPrice
    };
    return this.findAll(priceOptions);
  }

  async findByTags(tags: string[], options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const tagsOptions = {
      ...options,
      tags
    };
    return this.findAll(tagsOptions);
  }

  async findByBrand(brand: string, options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    // Note: brand field doesn't exist in Product entity, this method won't work
    // You might want to add brand field to Product entity or remove this method
    throw new Error('Brand field does not exist in Product entity');
  }

  async findFeatured(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const featuredOptions = {
      ...options,
      isFeatured: true
    };
    return this.findAll(featuredOptions);
  }

  async findInStock(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const inStockOptions = {
      ...options,
      inStock: true
    };
    return this.findAll(inStockOptions);
  }

  async findOutOfStock(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .where('(product.trackQuantity = true AND product.stockQuantity = 0)');

    const { page = 1, limit = 10 } = options;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findLowStock(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .where('product.trackQuantity = true')
      .andWhere('product.lowStockThreshold IS NOT NULL')
      .andWhere('product.stockQuantity <= product.lowStockThreshold');

    const { page = 1, limit = 10 } = options;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findOnSale(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .where('product.salePrice IS NOT NULL')
      .andWhere('product.salePrice > 0')
      .andWhere('product.salePrice < product.basePrice');

    const { page = 1, limit = 10 } = options;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findNew(days: number = 30, options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .where('product.createdAt >= :date', { date: dateThreshold });

    const { page = 1, limit = 10 } = options;
    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findPopular(options: ProductQueryDto = {}): Promise<PaginatedProducts> {
    // Note: viewCount doesn't exist in Product entity
    // Using sortOrder as proxy for popularity
    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .where('product.isActive = true')
      .orderBy('product.sortOrder', 'ASC');

    const { page = 1, limit = 10 } = options;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async findRelated(productId: string, limit: number = 5): Promise<Product[]> {
    const product = await this.findById(productId, ['category']);
    if (!product || !product.category) {
      return [];
    }

    return await this.productRepo.find({
      where: {
        categoryId: product.categoryId,
        id: Not(productId),
        status: ProductStatus.ACTIVE,
        isActive: true
      },
      take: limit,
      relations: ['category', 'images']
    });
  }

  async findSimilar(productId: string, limit: number = 5): Promise<Product[]> {
    const product = await this.findById(productId);
    if (!product) {
      return [];
    }

    return await this.productRepo.find({
      where: {
        categoryId: product.categoryId,
        id: Not(productId),
        status: ProductStatus.ACTIVE,
        isActive: true
      },
      take: limit,
      relations: ['category', 'images']
    });
  }

  // Estadísticas y reportes
  async getStats(): Promise<ProductStats> {
    const [totalProducts, activeProducts, inactiveProducts, featuredProducts] = await Promise.all([
      this.productRepo.count(),
      this.productRepo.count({ where: { isActive: true } }),
      this.productRepo.count({ where: { isActive: false } }),
      this.productRepo.count({ where: { isFeatured: true } })
    ]);

    const outOfStockProducts = await this.productRepo.count({
      where: {
        trackQuantity: true,
        stockQuantity: 0
      }
    });

    const lowStockProducts = await this.productRepo
      .createQueryBuilder('product')
      .where('product.trackQuantity = true')
      .andWhere('product.lowStockThreshold IS NOT NULL')
      .andWhere('product.stockQuantity <= product.lowStockThreshold')
      .getCount();

    const priceStats = await this.productRepo
      .createQueryBuilder('product')
      .select('AVG(product.basePrice)', 'avg')
      .addSelect('SUM(product.basePrice * product.stockQuantity)', 'total')
      .where('product.isActive = true')
      .getRawOne();

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      outOfStockProducts,
      lowStockProducts,
      averagePrice: parseFloat(priceStats.avg) || 0,
      totalValue: parseFloat(priceStats.total) || 0
    };
  }

  async getProductsByCategory(): Promise<ProductsByCategory[]> {
    const result = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('product.categoryId', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(product.id)', 'productCount')
      .groupBy('product.categoryId, category.name')
      .getRawMany();

    return result.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName || 'Sin categoría',
      productCount: parseInt(item.productCount)
    }));
  }

  async getTopSellingProducts(limit: number = 10): Promise<Product[]> {
    // Note: No sales data available, using sortOrder as proxy
    return await this.productRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      take: limit,
      relations: ['category', 'images']
    });
  }

  async getMostViewedProducts(limit: number = 10): Promise<Product[]> {
    // Note: viewCount doesn't exist, using sortOrder as proxy
    return await this.productRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      take: limit,
      relations: ['category', 'images']
    });
  }

  async getRecentProducts(limit: number = 10): Promise<Product[]> {
    return await this.productRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['category', 'images']
    });
  }

  async getPriceStatistics(): Promise<{ min: number; max: number; avg: number; median: number }> {
    const result = await this.productRepo
      .createQueryBuilder('product')
      .select('MIN(product.basePrice)', 'min')
      .addSelect('MAX(product.basePrice)', 'max')
      .addSelect('AVG(product.basePrice)', 'avg')
      .where('product.isActive = true')
      .getRawOne();

    // For median, we need a more complex query
    const medianResult = await this.productRepo
      .createQueryBuilder('product')
      .select('product.basePrice')
      .where('product.isActive = true')
      .orderBy('product.basePrice', 'ASC')
      .getMany();

    let median = 0;
    if (medianResult.length > 0) {
      const middle = Math.floor(medianResult.length / 2);
      if (medianResult.length % 2 === 0) {
        median = (medianResult[middle - 1].basePrice + medianResult[middle].basePrice) / 2;
      } else {
        median = medianResult[middle].basePrice;
      }
    }

    return {
      min: parseFloat(result.min) || 0,
      max: parseFloat(result.max) || 0,
      avg: parseFloat(result.avg) || 0,
      median
    };
  }

  // Gestión de stock
  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    product.stockQuantity = quantity;
    return await this.productRepo.save(product);
  }

  async incrementStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    product.stockQuantity += quantity;
    return await this.productRepo.save(product);
  }

  async decrementStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.trackQuantity && product.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }

    product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
    return await this.productRepo.save(product);
  }

  async checkStock(productId: string): Promise<{ inStock: boolean; quantity: number; isLowStock: boolean }> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const inStock = product.isInStock();
    const isLowStock = product.isLowStock();

    return {
      inStock,
      quantity: product.stockQuantity,
      isLowStock
    };
  }

  async bulkUpdateStock(updates: Array<{ productId: string; quantity: number }>): Promise<void> {
    for (const update of updates) {
      await this.updateStock(update.productId, update.quantity);
    }
  }

  // Gestión de estado
  async activate(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    product.isActive = true;
    product.status = ProductStatus.ACTIVE;
    return await this.productRepo.save(product);
  }

  async deactivate(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    product.isActive = false;
    product.status = ProductStatus.INACTIVE;
    return await this.productRepo.save(product);
  }

  async toggleStatus(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    product.isActive = !product.isActive;
    product.status = product.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    return await this.productRepo.save(product);
  }

  async setFeatured(id: string, featured: boolean, order?: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    product.isFeatured = featured;
    if (order !== undefined) {
      product.sortOrder = order;
    }
    return await this.productRepo.save(product);
  }

  async bulkUpdateStatus(ids: string[], status: boolean): Promise<void> {
    await this.productRepo.update(ids, { 
      isActive: status,
      status: status ? ProductStatus.ACTIVE : ProductStatus.INACTIVE
    });
  }

  // Utilidades
  async exists(id: string): Promise<boolean> {
    const count = await this.productRepo.count({ where: { id } });
    return count > 0;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const count = await this.productRepo.count({ where });
    return count > 0;
  }

  async existsBySku(sku: string, excludeId?: string): Promise<boolean> {
    const where: any = { sku };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const count = await this.productRepo.count({ where });
    return count > 0;
  }

  async count(options: ProductQueryDto = {}): Promise<number> {
    const queryBuilder = this.createQueryBuilder('product');
    this.applyFilters(queryBuilder, options);
    return await queryBuilder.getCount();
  }

  async generateSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await this.existsBySlug(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async generateSku(prefix?: string): Promise<string> {
    const skuPrefix = prefix || 'PRD';
    let sku: string;
    let counter = 1;

    do {
      const timestamp = Date.now().toString().slice(-6);
      sku = `${skuPrefix}${timestamp}${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (await this.existsBySku(sku));

    return sku;
  }

  // Métodos privados auxiliares
  private createQueryBuilder(alias: string): SelectQueryBuilder<Product> {
    return this.productRepo.createQueryBuilder(alias);
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Product>, options: ProductQueryDto): void {
    if (options.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    if (options.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: options.categoryId });
    }

    if (options.categoryIds?.length) {
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds: options.categoryIds });
    }

    if (options.status) {
      queryBuilder.andWhere('product.status = :status', { status: options.status });
    }

    if (options.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: options.isActive });
    }

    if (options.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: options.isFeatured });
    }

    if (options.minPrice !== undefined) {
      queryBuilder.andWhere('product.basePrice >= :minPrice', { minPrice: options.minPrice });
    }

    if (options.maxPrice !== undefined) {
      queryBuilder.andWhere('product.basePrice <= :maxPrice', { maxPrice: options.maxPrice });
    }

    if (options.inStock) {
      queryBuilder.andWhere(
        '(product.trackQuantity = false OR product.stockQuantity > 0 OR product.allowBackorder = true)'
      );
    }

    if (options.tags?.length) {
      queryBuilder.andWhere('product.metaKeywords && :tags', { tags: options.tags });
    }
  }

  private includeRelations(queryBuilder: SelectQueryBuilder<Product>, options: ProductQueryDto): void {
    if (options.includeCategories) {
      queryBuilder.leftJoinAndSelect('product.category', 'category');
    }

    if (options.includeVariants) {
      queryBuilder.leftJoinAndSelect('product.variants', 'variants');
    }

    if (options.includeImages) {
      queryBuilder.leftJoinAndSelect('product.images', 'images');
    }
  }
}