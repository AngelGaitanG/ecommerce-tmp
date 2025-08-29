import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Crear una nueva categoría
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Validar categoría padre si se proporciona
    if (createCategoryDto.parentId) {
      await this.validateParentCategory(createCategoryDto.parentId);
    }


    try {
      const category = await this.categoryRepository.create({
        ...createCategoryDto,
      });

      this.logger.log(`Category created successfully: ${category.id}`);
      return new CategoryResponseDto(category);
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la categoría');
    }
  }

  /**
   * Obtener todas las categorías con filtros
   */
  async findAll(queryDto: QueryCategoryDto): Promise<{
    categories: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log('Fetching categories with filters');

    const result = await this.categoryRepository.findWithFilters(queryDto);

    return {
      ...result,
      categories: result.categories.map(category => new CategoryResponseDto(category)),
    };
  }

  /**
   * Obtener categoría por ID
   */
  async findOne(
    id: string,
    includeParent: boolean = false,
    includeChildren: boolean = false,
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Fetching category by ID: ${id}`);

    const category = await this.categoryRepository.findById(id, includeParent, includeChildren);

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return new CategoryResponseDto(category);
  }

  /**
   * Obtener categoría por slug
   */
  async findBySlug(
    slug: string,
    includeParent: boolean = false,
    includeChildren: boolean = false,
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Fetching category by slug: ${slug}`);

    const category = await this.categoryRepository.findBySlug(slug, includeParent, includeChildren);

    if (!category) {
      throw new NotFoundException(`Categoría con slug '${slug}' no encontrada`);
    }

    return new CategoryResponseDto(category);
  }

  /**
   * Obtener categorías raíz
   */
  async findRootCategories(
    isActive?: boolean,
    includeChildren: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching root categories');

    const categories = await this.categoryRepository.findRootCategories(isActive, includeChildren);

    return categories.map(category => new CategoryResponseDto(category));
  }

  /**
   * Obtener subcategorías de una categoría
   */
  async findChildren(
    parentId: string,
    isActive?: boolean,
    includeChildren: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    this.logger.log(`Fetching children for category: ${parentId}`);

    // Verificar que la categoría padre existe
    await this.validateCategoryExists(parentId);

    const categories = await this.categoryRepository.findChildren(
      parentId,
      isActive,
      includeChildren,
    );

    return categories.map(category => new CategoryResponseDto(category));
  }

  /**
   * Obtener árbol completo de categorías
   */
  async findTree(isActive?: boolean): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching category tree');

    const categories = await this.categoryRepository.findTree(isActive);

    return categories.map(category => new CategoryResponseDto(category));
  }

  /**
   * Obtener ancestros de una categoría
   */
  async findAncestors(id: string): Promise<CategoryResponseDto[]> {
    this.logger.log(`Fetching ancestors for category: ${id}`);

    const category = await this.validateCategoryExists(id);
    const ancestors = await this.categoryRepository.findAncestors(category);

    return ancestors.map(ancestor => new CategoryResponseDto(ancestor));
  }

  /**
   * Obtener descendientes de una categoría
   */
  async findDescendants(id: string): Promise<CategoryResponseDto[]> {
    this.logger.log(`Fetching descendants for category: ${id}`);

    const category = await this.validateCategoryExists(id);
    const descendants = await this.categoryRepository.findDescendants(category);

    return descendants.map(descendant => new CategoryResponseDto(descendant));
  }

  /**
   * Actualizar una categoría
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    // Validar que la categoría existe
    await this.validateCategoryExists(id);

    // Validar categoría padre si se está actualizando
    if (updateCategoryDto.parentId) {
      await this.validateParentCategory(updateCategoryDto.parentId, id);
    }

    // Crear objeto de actualización
    const updateData: Partial<Category> = { ...updateCategoryDto };

    // Generar nuevo slug si se está actualizando el nombre
    if (updateCategoryDto.name) {
      const slug = await this.generateUniqueSlug(updateCategoryDto.name, id);
      updateData.slug = slug;
    }

    try {
      const updatedCategory = await this.categoryRepository.update(id, updateData);

      if (!updatedCategory) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      this.logger.log(`Category updated successfully: ${id}`);
      return new CategoryResponseDto(updatedCategory);
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Error al actualizar la categoría');
    }
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    this.logger.log(`Removing category: ${id}`);

    // Verificar que la categoría existe
    await this.validateCategoryExists(id);

    // Verificar que no tiene subcategorías
    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías. Elimine primero las subcategorías.',
      );
    }

    // TODO: Verificar que no tiene productos asociados
    // const hasProducts = await this.categoryRepository.hasProducts(id);
    // if (hasProducts) {
    //   throw new BadRequestException(
    //     'No se puede eliminar una categoría que tiene productos asociados.',
    //   );
    // }

    const removed = await this.categoryRepository.remove(id);

    if (!removed) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    this.logger.log(`Category removed successfully: ${id}`);
    return { message: 'Categoría eliminada exitosamente' };
  }

  /**
   * Eliminar permanentemente una categoría
   */
  async hardRemove(id: string): Promise<{ message: string }> {
    this.logger.log(`Hard removing category: ${id}`);

    // Verificar que la categoría existe
    await this.validateCategoryExists(id);

    // Verificar que no tiene subcategorías
    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'No se puede eliminar permanentemente una categoría que tiene subcategorías.',
      );
    }

    const removed = await this.categoryRepository.hardRemove(id);

    if (!removed) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    this.logger.log(`Category hard removed successfully: ${id}`);
    return { message: 'Categoría eliminada permanentemente' };
  }

  /**
   * Buscar categorías por nombre
   */
  async searchByName(
    name: string,
    isActive?: boolean,
    limit: number = 10,
  ): Promise<CategoryResponseDto[]> {
    this.logger.log(`Searching categories by name: ${name}`);

    if (!name || name.trim().length < 2) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
    }

    const categories = await this.categoryRepository.searchByName(name.trim(), isActive, limit);

    return categories.map(category => new CategoryResponseDto(category));
  }

  /**
   * Obtener categorías populares
   */
  async findPopularCategories(limit: number = 10): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching popular categories');

    const categories = await this.categoryRepository.findPopularCategories(limit);

    return categories.map(category => new CategoryResponseDto(category));
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(
    categoryOrders: { id: string; sortOrder: number }[],
  ): Promise<{ message: string }> {
    this.logger.log('Reordering categories');

    // Validar que todas las categorías existen
    for (const { id } of categoryOrders) {
      await this.validateCategoryExists(id);
    }

    // Validar que no hay órdenes duplicados
    const sortOrders = categoryOrders.map(item => item.sortOrder);
    const uniqueSortOrders = new Set(sortOrders);
    if (sortOrders.length !== uniqueSortOrders.size) {
      throw new BadRequestException('No se pueden tener órdenes duplicados');
    }

    await this.categoryRepository.reorderCategories(categoryOrders);

    this.logger.log('Categories reordered successfully');
    return { message: 'Categorías reordenadas exitosamente' };
  }

  /**
   * Activar/Desactivar una categoría
   */
  async toggleActive(id: string): Promise<CategoryResponseDto> {
    this.logger.log(`Toggling active status for category: ${id}`);

    const category = await this.validateCategoryExists(id);
    
    const updatedCategory = await this.categoryRepository.update(id, {
      isActive: !category.isActive,
    });

    if (!updatedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    this.logger.log(`Category active status toggled: ${id}`);
    return new CategoryResponseDto(updatedCategory);
  }

  /**
   * Obtener estadísticas de categorías
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    rootCategories: number;
    withChildren: number;
  }> {
    this.logger.log('Fetching category statistics');

    const [total, active, inactive, rootCategories] = await Promise.all([
      this.categoryRepository.countByFilters(),
      this.categoryRepository.countByFilters(undefined, true),
      this.categoryRepository.countByFilters(undefined, false),
      this.categoryRepository.countByFilters(undefined, undefined, undefined, true),
    ]);

    // TODO: Implementar conteo de categorías con hijos
    const withChildren = 0;

    return {
      total,
      active,
      inactive,
      rootCategories,
      withChildren,
    };
  }

  // Métodos privados de validación y utilidades

  /**
   * Validar que una categoría existe
   */
  private async validateCategoryExists(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    
    return category;
  }

  /**
   * Validar categoría padre
   */
  private async validateParentCategory(parentId: string, excludeId?: string): Promise<void> {
    // Verificar que la categoría padre existe
    const parentCategory = await this.validateCategoryExists(parentId);

    // Verificar que no se está intentando hacer una categoría padre de sí misma
    if (excludeId && parentId === excludeId) {
      throw new BadRequestException('Una categoría no puede ser padre de sí misma');
    }

    // TODO: Verificar que no se está creando una referencia circular
    // (una categoría no puede ser padre de uno de sus ancestros)
    if (excludeId) {
      const descendants = await this.categoryRepository.findDescendants(parentCategory);
      const isCircular = descendants.some(descendant => descendant.id === excludeId);
      
      if (isCircular) {
        throw new BadRequestException(
          'No se puede crear una referencia circular en la jerarquía de categorías',
        );
      }
    }
  }

  /**
   * Generar slug único
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.createSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.categoryRepository.existsBySlug(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Crear slug a partir de un nombre
   */
  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  }
}