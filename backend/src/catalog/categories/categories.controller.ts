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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CustomResponse } from '../../core/custom-response';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear nueva categoría
   */
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoriesService.create(createCategoryDto);
      return CustomResponse.created('Categoría creada exitosamente', category);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener todas las categorías con filtros y paginación
   */
  @Get()
  async findAll(@Query() queryDto: QueryCategoryDto) {
    try {
      const result = await this.categoriesService.findAll(queryDto);
      return CustomResponse.success('Categorías obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener árbol completo de categorías
   */
  @Get('tree')
  async findTree(
    @Query('isActive') isActive?: boolean,
  ) {
    try {
      const tree = await this.categoriesService.findTree(isActive);
      return CustomResponse.success('Árbol de categorías obtenido exitosamente', tree);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener categorías raíz
   */
  @Get('roots')
  async findRootCategories(
    @Query('isActive') isActive?: boolean,
    @Query('includeChildren') includeChildren: boolean = false,
  ) {
    try {
      const categories = await this.categoriesService.findRootCategories(isActive, includeChildren);
      return CustomResponse.success('Categorías raíz obtenidas exitosamente', categories);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Buscar categorías por nombre
   */
  @Get('search')
  async searchByName(
    @Query('name') name: string,
    @Query('isActive') isActive?: boolean,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    try {
      const categories = await this.categoriesService.searchByName(name, isActive, limit);
      return CustomResponse.success('Búsqueda completada exitosamente', categories);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de categorías
   */
  @Get('statistics')
  async getStatistics() {
    try {
      const stats = await this.categoriesService.getStatistics();
      return CustomResponse.success('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener categorías populares
   */
  @Get('popular')
  async findPopularCategories(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    try {
      const categories = await this.categoriesService.findPopularCategories(limit);
      return CustomResponse.success('Categorías populares obtenidas exitosamente', categories);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener categoría por slug
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeParent') includeParent: boolean = false,
    @Query('includeChildren') includeChildren: boolean = false,
  ) {
    try {
      const category = await this.categoriesService.findBySlug(slug, includeParent, includeChildren);
      return CustomResponse.success('Categoría encontrada', category);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener categoría por ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeParent') includeParent: boolean = false,
    @Query('includeChildren') includeChildren: boolean = false,
  ) {
    try {
      const category = await this.categoriesService.findOne(id, includeParent, includeChildren);
      return CustomResponse.success('Categoría encontrada', category);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener subcategorías de una categoría
   */
  @Get(':id/children')
  async findChildren(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive') isActive?: boolean,
    @Query('includeChildren') includeChildren: boolean = false,
  ) {
    try {
      const children = await this.categoriesService.findChildren(id, isActive, includeChildren);
      return CustomResponse.success('Subcategorías obtenidas exitosamente', children);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener categorías padre (ancestros)
   */
  @Get(':id/ancestors')
  async findAncestors(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const ancestors = await this.categoriesService.findAncestors(id);
      return CustomResponse.success('Categorías padre obtenidas exitosamente', ancestors);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener todas las subcategorías (descendientes)
   */
  @Get(':id/descendants')
  async findDescendants(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const descendants = await this.categoriesService.findDescendants(id);
      return CustomResponse.success('Subcategorías descendientes obtenidas exitosamente', descendants);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar categoría
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.categoriesService.update(id, updateCategoryDto);
      return CustomResponse.success('Categoría actualizada exitosamente', category);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Activar/Desactivar categoría
   */
  @Patch(':id/toggle')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const category = await this.categoriesService.toggleActive(id);
      return CustomResponse.success('Estado de categoría actualizado exitosamente', category);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Reordenar categorías
   */
  @Post('reorder')
  async reorderCategories(
    @Body() categoryOrders: { id: string; sortOrder: number }[],
  ) {
    try {
      const result = await this.categoriesService.reorderCategories(categoryOrders);
      return CustomResponse.success('Categorías reordenadas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar categoría (soft delete)
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.categoriesService.remove(id);
      return CustomResponse.success('Categoría eliminada exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar categoría permanentemente
   */
  @Delete(':id/hard')
  async hardRemove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.categoriesService.hardRemove(id);
      return CustomResponse.success('Categoría eliminada permanentemente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }
}