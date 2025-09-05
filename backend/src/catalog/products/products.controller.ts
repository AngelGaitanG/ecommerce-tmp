import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CustomResponse } from '../../core/custom-response';
import { Auth } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { Role } from '../../auth/roles/enums/role.enum';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear nuevo producto
   */
  @Auth(Role.ADMIN)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);
      return CustomResponse.created('Producto creado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener todos los productos con filtros y paginación
   */
  @Public()
  @Get()
  async findAll(@Query() queryDto: ProductQueryDto) {
    try {
      const result = await this.productsService.findAll(queryDto);
      return CustomResponse.success('Productos obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Buscar productos por término de búsqueda
   */
  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query() options: ProductQueryDto,
  ) {
    try {
      const result = await this.productsService.search(query, options);
      return CustomResponse.success('Búsqueda completada exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos destacados
   */
  @Public()
  @Get('featured')
  async findFeatured(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findFeatured(options);
      return CustomResponse.success('Productos destacados obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos en stock
   */
  @Public()
  @Get('in-stock')
  async findInStock(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findInStock(options);
      return CustomResponse.success('Productos en stock obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos sin stock
   */
  @Public()
  @Get('out-of-stock')
  async findOutOfStock(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findOutOfStock(options);
      return CustomResponse.success('Productos sin stock obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  @Public()
  @Get('low-stock')
  async findLowStock(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findLowStock(options);
      return CustomResponse.success('Productos con stock bajo obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos en oferta
   */
  @Public()
  @Get('on-sale')
  async findOnSale(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findOnSale(options);
      return CustomResponse.success('Productos en oferta obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos nuevos
   */
  @Public()
  @Get('new')
  async findNew(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query() options: ProductQueryDto,
  ) {
    try {
      const result = await this.productsService.findNew(days, options);
      return CustomResponse.success('Productos nuevos obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos populares
   */
  @Get('popular')
  async findPopular(@Query() options: ProductQueryDto) {
    try {
      const result = await this.productsService.findPopular(options);
      return CustomResponse.success('Productos populares obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por categoría
   */
  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() options: ProductQueryDto,
  ) {
    try {
      const result = await this.productsService.findByCategory(categoryId, options);
      return CustomResponse.success('Productos por categoría obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por múltiples categorías
   */
  @Get('categories')
  async findByCategories(
    @Query('categoryIds') categoryIds: string[],
    @Query() options: ProductQueryDto,
  ) {
    try {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      const result = await this.productsService.findByCategories(ids, options);
      return CustomResponse.success('Productos por categorías obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por rango de precios
   */
  @Public()
  @Get('price-range')
  async findByPriceRange(
    @Query('minPrice', ParseIntPipe) minPrice: number,
    @Query('maxPrice', ParseIntPipe) maxPrice: number,
    @Query() options: ProductQueryDto,
  ) {
    try {
      const result = await this.productsService.findByPriceRange(minPrice, maxPrice, options);
      return CustomResponse.success('Productos por rango de precio obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por etiquetas
   */
  @Public()
  @Get('tags')
  async findByTags(
    @Query('tags') tags: string[],
    @Query() options: ProductQueryDto,
  ) {
    try {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const result = await this.productsService.findByTags(tagArray, options);
      return CustomResponse.success('Productos por etiquetas obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por marca
   */
  @Public()
  @Get('brand/:brand')
  async findByBrand(
    @Param('brand') brand: string,
    @Query() options: ProductQueryDto,
  ) {
    try {
      const result = await this.productsService.findByBrand(brand, options);
      return CustomResponse.success('Productos por marca obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de productos
   */
  @Public()
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.productsService.getStats();
      return CustomResponse.success('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos por categoría (estadísticas)
   */
  @Public()
  @Get('stats/by-category')
  async getProductsByCategory() {
    try {
      const result = await this.productsService.getProductsByCategory();
      return CustomResponse.success('Estadísticas por categoría obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos más vendidos
   */
  @Public()
  @Get('stats/top-selling')
  async getTopSellingProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.productsService.getTopSellingProducts(limit);
      return CustomResponse.success('Productos más vendidos obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos más vistos
   */
  @Public()
  @Get('stats/most-viewed')
  async getMostViewedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.productsService.getMostViewedProducts(limit);
      return CustomResponse.success('Productos más vistos obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos recientes
   */
  @Get('stats/recent')
  async getRecentProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.productsService.getRecentProducts(limit);
      return CustomResponse.success('Productos recientes obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de precios
   */
  @Get('stats/price-statistics')
  async getPriceStatistics() {
    try {
      const result = await this.productsService.getPriceStatistics();
      return CustomResponse.success('Estadísticas de precios obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener producto por slug
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeRelations', new DefaultValuePipe(true), ParseBoolPipe) includeRelations: boolean,
  ) {
    try {
      const product = await this.productsService.findBySlug(slug, includeRelations);
      return CustomResponse.success('Producto encontrado', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener producto por SKU
   */
  @Get('sku/:sku')
  async findBySku(
    @Param('sku') sku: string,
    @Query('includeRelations', new DefaultValuePipe(true), ParseBoolPipe) includeRelations: boolean,
  ) {
    try {
      const product = await this.productsService.findBySku(sku, includeRelations);
      return CustomResponse.success('Producto encontrado', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener producto por ID
   */
  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new DefaultValuePipe(true), ParseBoolPipe) includeRelations: boolean,
  ) {
    try {
      const product = await this.productsService.findOne(id, includeRelations);
      return CustomResponse.success('Producto encontrado', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos relacionados
   */
  @Get(':id/related')
  async findRelated(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.productsService.findRelated(id, limit);
      return CustomResponse.success('Productos relacionados obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos similares
   */
  @Get(':id/similar')
  async findSimilar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.productsService.findSimilar(id, limit);
      return CustomResponse.success('Productos similares obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await this.productsService.update(id, updateProductDto);
      return CustomResponse.success('Producto actualizado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.productsService.remove(id);
      return CustomResponse.success('Producto eliminado exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Restaurar producto eliminado
   */
  @Auth(Role.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await this.productsService.restore(id);
      return CustomResponse.success('Producto restaurado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar producto permanentemente
   */
  @Auth(Role.ADMIN)
  @Delete(':id/hard')
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.productsService.hardDelete(id);
      return CustomResponse.success('Producto eliminado permanentemente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar stock del producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    try {
      const product = await this.productsService.updateStock(id, quantity);
      return CustomResponse.success('Stock actualizado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Incrementar stock del producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/stock/increment')
  async incrementStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    try {
      const product = await this.productsService.incrementStock(id, quantity);
      return CustomResponse.success('Stock incrementado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Decrementar stock del producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/stock/decrement')
  async decrementStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    try {
      const product = await this.productsService.decrementStock(id, quantity);
      return CustomResponse.success('Stock decrementado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar estado del stock
   */
  @Public()
  @Get(':id/stock/check')
  async checkStock(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.productsService.checkStock(id);
      return CustomResponse.success('Estado del stock obtenido exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualización masiva de stock
   */
  @Auth(Role.ADMIN)
  @Patch('stock/bulk-update')
  async bulkUpdateStock(
    @Body('updates') updates: Array<{ productId: string; quantity: number }>,
  ) {
    try {
      const result = await this.productsService.bulkUpdateStock(updates);
      return CustomResponse.success('Stock actualizado masivamente exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Activar producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/activate')
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await this.productsService.activate(id);
      return CustomResponse.success('Producto activado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Desactivar producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await this.productsService.deactivate(id);
      return CustomResponse.success('Producto desactivado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Alternar estado activo del producto
   */
  @Auth(Role.ADMIN)
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await this.productsService.toggleStatus(id);
      return CustomResponse.success('Estado del producto actualizado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Establecer producto como destacado
   */
  @Auth(Role.ADMIN)
  @Patch(':id/featured')
  async setFeatured(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('featured', ParseBoolPipe) featured: boolean,
    @Body('order') order?: number,
  ) {
    try {
      const product = await this.productsService.setFeatured(id, featured, order);
      return CustomResponse.success('Estado destacado actualizado exitosamente', product);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualización masiva de estado
   */
  @Auth(Role.ADMIN)
  @Patch('status/bulk-update')
  async bulkUpdateStatus(
    @Body('ids') ids: string[],
    @Body('status', ParseBoolPipe) status: boolean,
  ) {
    try {
      const result = await this.productsService.bulkUpdateStatus(ids, status);
      return CustomResponse.success('Estado actualizado masivamente exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar si el producto existe
   */
  @Public()
  @Get('utils/exists/:id')
  async exists(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const exists = await this.productsService.exists(id);
      return CustomResponse.success('Verificación completada', { exists });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar si el slug existe
   */
  @Get('utils/exists-slug/:slug')
  async existsBySlug(
    @Param('slug') slug: string,
    @Query('excludeId') excludeId?: string,
  ) {
    try {
      const exists = await this.productsService.existsBySlug(slug, excludeId);
      return CustomResponse.success('Verificación de slug completada', { exists });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar si el SKU existe
   */
  @Get('utils/exists-sku/:sku')
  async existsBySku(
    @Param('sku') sku: string,
    @Query('excludeId') excludeId?: string,
  ) {
    try {
      const exists = await this.productsService.existsBySku(sku, excludeId);
      return CustomResponse.success('Verificación de SKU completada', { exists });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Contar productos con filtros opcionales
   */
  @Get('utils/count')
  async count(@Query() options: ProductQueryDto) {
    try {
      const count = await this.productsService.count(options);
      return CustomResponse.success('Conteo obtenido exitosamente', { count });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Generar slug único desde el nombre del producto
   */
  @Post('utils/generate-slug')
  async generateSlug(
    @Body('name') name: string,
    @Body('excludeId') excludeId?: string,
  ) {
    try {
      const slug = await this.productsService.generateSlug(name, excludeId);
      return CustomResponse.success('Slug generado exitosamente', { slug });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Generar SKU único
   */
  @Post('utils/generate-sku')
  async generateSku(@Body('prefix') prefix?: string) {
    try {
      const sku = await this.productsService.generateSku(prefix);
      return CustomResponse.success('SKU generado exitosamente', { sku });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }
}