import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginatedProducts, ProductStats, ProductsByCategory } from './repositories/product-repository.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productEntityRepository: Repository<Product>,
    private readonly productRepository: ProductRepository,
  ) {}

  // CRUD básico
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Validar que el SKU no exista si se proporciona
      if (createProductDto.sku) {
        const existingSku = await this.productRepository.existsBySku(createProductDto.sku);
        if (existingSku) {
          throw new ConflictException(`Product with SKU '${createProductDto.sku}' already exists`);
        }
      }

      // Validar que el slug no exista si se proporciona
      if (createProductDto.slug) {
        const existingSlug = await this.productRepository.existsBySlug(createProductDto.slug);
        if (existingSlug) {
          throw new ConflictException(`Product with slug '${createProductDto.slug}' already exists`);
        }
      }

      // Validar precios
      if (createProductDto.salePrice && createProductDto.salePrice >= createProductDto.basePrice) {
        throw new BadRequestException('Sale price must be lower than base price');
      }

      if (createProductDto.costPrice && createProductDto.costPrice >= createProductDto.basePrice) {
        throw new BadRequestException('Cost price should be lower than base price');
      }

      return await this.productRepository.create(createProductDto);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create product: ' + error.message);
    }
  }

  async findAll(queryDto?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findAll(queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve products: ' + error.message);
    }
  }

  async findOne(id: string, includeRelations: boolean = true): Promise<Product> {
    try {
      const relations = includeRelations ? ['category', 'variants', 'images'] : [];
      const product = await this.productRepository.findById(id, relations);
      
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve product: ' + error.message);
    }
  }

  async findBySlug(slug: string, includeRelations: boolean = true): Promise<Product> {
    try {
      const relations = includeRelations ? ['category', 'variants', 'images'] : [];
      const product = await this.productRepository.findBySlug(slug, relations);
      
      if (!product) {
        throw new NotFoundException(`Product with slug '${slug}' not found`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve product: ' + error.message);
    }
  }

  async findBySku(sku: string, includeRelations: boolean = true): Promise<Product> {
    try {
      const relations = includeRelations ? ['category', 'variants', 'images'] : [];
      const product = await this.productRepository.findBySku(sku, relations);
      
      if (!product) {
        throw new NotFoundException(`Product with SKU '${sku}' not found`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve product: ' + error.message);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      // Verificar que el producto existe
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      // Validar SKU único si se está actualizando
      if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
        const existingSku = await this.productRepository.existsBySku(updateProductDto.sku, id);
        if (existingSku) {
          throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists`);
        }
      }

      // Validar slug único si se está actualizando
      if (updateProductDto.slug && updateProductDto.slug !== existingProduct.slug) {
        const existingSlug = await this.productRepository.existsBySlug(updateProductDto.slug, id);
        if (existingSlug) {
          throw new ConflictException(`Product with slug '${updateProductDto.slug}' already exists`);
        }
      }

      // Validar precios
      const basePrice = updateProductDto.basePrice ?? existingProduct.basePrice;
      if (updateProductDto.salePrice && updateProductDto.salePrice >= basePrice) {
        throw new BadRequestException('Sale price must be lower than base price');
      }

      if (updateProductDto.costPrice && updateProductDto.costPrice >= basePrice) {
        throw new BadRequestException('Cost price should be lower than base price');
      }

      return await this.productRepository.update(id, updateProductDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update product: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      await this.productRepository.softDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product: ' + error.message);
    }
  }

  async restore(id: string): Promise<Product> {
    try {
      await this.productRepository.restore(id);
      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Failed to restore product: ' + error.message);
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      await this.productRepository.hardDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to permanently delete product: ' + error.message);
    }
  }

  // Búsquedas avanzadas
  async search(query: string, options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException('Search query cannot be empty');
      }
      return await this.productRepository.search(query, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to search products: ' + error.message);
    }
  }

  async findByCategory(categoryId: string, options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findByCategory(categoryId, options);
    } catch (error) {
      throw new BadRequestException('Failed to find products by category: ' + error.message);
    }
  }

  async findByCategories(categoryIds: string[], options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (!categoryIds || categoryIds.length === 0) {
        throw new BadRequestException('Category IDs array cannot be empty');
      }
      return await this.productRepository.findByCategories(categoryIds, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find products by categories: ' + error.message);
    }
  }

  async findByPriceRange(minPrice: number, maxPrice: number, options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (minPrice < 0 || maxPrice < 0) {
        throw new BadRequestException('Prices cannot be negative');
      }
      if (minPrice > maxPrice) {
        throw new BadRequestException('Minimum price cannot be greater than maximum price');
      }
      return await this.productRepository.findByPriceRange(minPrice, maxPrice, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find products by price range: ' + error.message);
    }
  }

  async findByTags(tags: string[], options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (!tags || tags.length === 0) {
        throw new BadRequestException('Tags array cannot be empty');
      }
      return await this.productRepository.findByTags(tags, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find products by tags: ' + error.message);
    }
  }

  async findByBrand(brand: string, options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (!brand || brand.trim().length === 0) {
        throw new BadRequestException('Brand cannot be empty');
      }
      return await this.productRepository.findByBrand(brand, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find products by brand: ' + error.message);
    }
  }

  async findFeatured(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findFeatured(options);
    } catch (error) {
      throw new BadRequestException('Failed to find featured products: ' + error.message);
    }
  }

  async findInStock(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findInStock(options);
    } catch (error) {
      throw new BadRequestException('Failed to find in-stock products: ' + error.message);
    }
  }

  async findOutOfStock(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findOutOfStock(options);
    } catch (error) {
      throw new BadRequestException('Failed to find out-of-stock products: ' + error.message);
    }
  }

  async findLowStock(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findLowStock(options);
    } catch (error) {
      throw new BadRequestException('Failed to find low-stock products: ' + error.message);
    }
  }

  async findOnSale(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findOnSale(options);
    } catch (error) {
      throw new BadRequestException('Failed to find products on sale: ' + error.message);
    }
  }

  async findNew(days: number = 30, options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      if (days <= 0) {
        throw new BadRequestException('Days must be a positive number');
      }
      return await this.productRepository.findNew(days, options);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to find new products: ' + error.message);
    }
  }

  async findPopular(options?: ProductQueryDto): Promise<PaginatedProducts> {
    try {
      return await this.productRepository.findPopular(options);
    } catch (error) {
      throw new BadRequestException('Failed to find popular products: ' + error.message);
    }
  }

  async findRelated(productId: string, limit: number = 5): Promise<Product[]> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }
      return await this.productRepository.findRelated(productId, limit);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to find related products: ' + error.message);
    }
  }

  async findSimilar(productId: string, limit: number = 5): Promise<Product[]> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }
      return await this.productRepository.findSimilar(productId, limit);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to find similar products: ' + error.message);
    }
  }

  // Estadísticas y reportes
  async getStats(): Promise<ProductStats> {
    try {
      return await this.productRepository.getStats();
    } catch (error) {
      throw new BadRequestException('Failed to get product statistics: ' + error.message);
    }
  }

  async getProductsByCategory(): Promise<ProductsByCategory[]> {
    try {
      return await this.productRepository.getProductsByCategory();
    } catch (error) {
      throw new BadRequestException('Failed to get products by category: ' + error.message);
    }
  }

  async getTopSellingProducts(limit: number = 10): Promise<Product[]> {
    try {
      if (limit <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }
      return await this.productRepository.getTopSellingProducts(limit);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to get top selling products: ' + error.message);
    }
  }

  async getMostViewedProducts(limit: number = 10): Promise<Product[]> {
    try {
      if (limit <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }
      return await this.productRepository.getMostViewedProducts(limit);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to get most viewed products: ' + error.message);
    }
  }

  async getRecentProducts(limit: number = 10): Promise<Product[]> {
    try {
      if (limit <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }
      return await this.productRepository.getRecentProducts(limit);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to get recent products: ' + error.message);
    }
  }

  async getPriceStatistics(): Promise<{ min: number; max: number; avg: number; median: number }> {
    try {
      return await this.productRepository.getPriceStatistics();
    } catch (error) {
      throw new BadRequestException('Failed to get price statistics: ' + error.message);
    }
  }

  // Gestión de stock
  async updateStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }

      if (quantity < 0) {
        throw new BadRequestException('Stock quantity cannot be negative');
      }

      return await this.productRepository.updateStock(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update stock: ' + error.message);
    }
  }

  async incrementStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }

      if (quantity <= 0) {
        throw new BadRequestException('Increment quantity must be positive');
      }

      return await this.productRepository.incrementStock(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to increment stock: ' + error.message);
    }
  }

  async decrementStock(productId: string, quantity: number): Promise<Product> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }

      if (quantity <= 0) {
        throw new BadRequestException('Decrement quantity must be positive');
      }

      // Verificar que hay suficiente stock
      const stockInfo = await this.productRepository.checkStock(productId);
      if (stockInfo.quantity < quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${stockInfo.quantity}, Requested: ${quantity}`);
      }

      return await this.productRepository.decrementStock(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to decrement stock: ' + error.message);
    }
  }

  async checkStock(productId: string): Promise<{ inStock: boolean; quantity: number; isLowStock: boolean }> {
    try {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${productId}' not found`);
      }

      return await this.productRepository.checkStock(productId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to check stock: ' + error.message);
    }
  }

  async bulkUpdateStock(updates: Array<{ productId: string; quantity: number }>): Promise<void> {
    try {
      if (!updates || updates.length === 0) {
        throw new BadRequestException('Updates array cannot be empty');
      }

      // Validar que todos los productos existen
      for (const update of updates) {
        if (update.quantity < 0) {
          throw new BadRequestException(`Stock quantity cannot be negative for product ${update.productId}`);
        }
        
        const product = await this.productRepository.findById(update.productId);
        if (!product) {
          throw new NotFoundException(`Product with ID '${update.productId}' not found`);
        }
      }

      await this.productRepository.bulkUpdateStock(updates);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to bulk update stock: ' + error.message);
    }
  }

  // Gestión de estado
  async activate(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      return await this.productRepository.activate(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to activate product: ' + error.message);
    }
  }

  async deactivate(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      return await this.productRepository.deactivate(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate product: ' + error.message);
    }
  }

  async toggleStatus(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      return await this.productRepository.toggleStatus(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle product status: ' + error.message);
    }
  }

  async setFeatured(id: string, featured: boolean, order?: number): Promise<Product> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }

      if (order !== undefined && order < 0) {
        throw new BadRequestException('Featured order cannot be negative');
      }

      return await this.productRepository.setFeatured(id, featured, order);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to set featured status: ' + error.message);
    }
  }

  async bulkUpdateStatus(ids: string[], status: boolean): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestException('Product IDs array cannot be empty');
      }

      // Validar que todos los productos existen
      for (const id of ids) {
        const product = await this.productRepository.findById(id);
        if (!product) {
          throw new NotFoundException(`Product with ID '${id}' not found`);
        }
      }

      await this.productRepository.bulkUpdateStatus(ids, status);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to bulk update status: ' + error.message);
    }
  }

  // Utilidades
  async exists(id: string): Promise<boolean> {
    try {
      return await this.productRepository.exists(id);
    } catch (error) {
      throw new BadRequestException('Failed to check if product exists: ' + error.message);
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      return await this.productRepository.existsBySlug(slug, excludeId);
    } catch (error) {
      throw new BadRequestException('Failed to check if slug exists: ' + error.message);
    }
  }

  async existsBySku(sku: string, excludeId?: string): Promise<boolean> {
    try {
      return await this.productRepository.existsBySku(sku, excludeId);
    } catch (error) {
      throw new BadRequestException('Failed to check if SKU exists: ' + error.message);
    }
  }

  async count(options?: ProductQueryDto): Promise<number> {
    try {
      return await this.productRepository.count(options);
    } catch (error) {
      throw new BadRequestException('Failed to count products: ' + error.message);
    }
  }

  async generateSlug(name: string, excludeId?: string): Promise<string> {
    try {
      if (!name || name.trim().length === 0) {
        throw new BadRequestException('Product name cannot be empty');
      }
      return await this.productRepository.generateSlug(name, excludeId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate slug: ' + error.message);
    }
  }

  async generateSku(prefix?: string): Promise<string> {
    try {
      return await this.productRepository.generateSku(prefix);
    } catch (error) {
      throw new BadRequestException('Failed to generate SKU: ' + error.message);
    }
  }
}