import { Category } from '../entities/category.entity';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export interface ICategoryRepository {
  /**
   * Crear una nueva categoría
   */
  create(createCategoryDto: CreateCategoryDto): Promise<Category>;

  /**
   * Buscar categoría por ID con relaciones opcionales
   */
  findById(
    id: string,
    includeParent?: boolean,
    includeChildren?: boolean,
  ): Promise<Category | null>;

  /**
   * Buscar categoría por slug
   */
  findBySlug(
    slug: string,
    includeParent?: boolean,
    includeChildren?: boolean,
  ): Promise<Category | null>;

  /**
   * Verificar si existe una categoría con el mismo slug
   */
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;

  /**
   * Buscar categorías con filtros y paginación
   */
  findWithFilters(queryDto: QueryCategoryDto): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Obtener todas las categorías raíz (sin padre)
   */
  findRootCategories(
    isActive?: boolean,
    includeChildren?: boolean,
  ): Promise<Category[]>;

  /**
   * Obtener subcategorías de una categoría padre
   */
  findChildren(
    parentId: string,
    isActive?: boolean,
    includeChildren?: boolean,
  ): Promise<Category[]>;

  /**
   * Obtener el árbol completo de categorías
   */
  findTree(isActive?: boolean): Promise<Category[]>;

  /**
   * Obtener todos los ancestros de una categoría
   */
  findAncestors(category: Category): Promise<Category[]>;

  /**
   * Obtener todos los descendientes de una categoría
   */
  findDescendants(category: Category): Promise<Category[]>;

  /**
   * Actualizar una categoría
   */
  update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null>;

  /**
   * Eliminar una categoría (soft delete)
   */
  remove(id: string): Promise<boolean>;

  /**
   * Eliminar permanentemente una categoría
   */
  hardRemove(id: string): Promise<boolean>;

  /**
   * Verificar si una categoría tiene subcategorías
   */
  hasChildren(id: string): Promise<boolean>;

  /**
   * Obtener el conteo de categorías por filtros
   */
  countByFilters(
    search?: string,
    isActive?: boolean,
    parentId?: string,
    rootOnly?: boolean,
  ): Promise<number>;

  /**
   * Buscar categorías por nombre (búsqueda parcial)
   */
  searchByName(
    name: string,
    isActive?: boolean,
    limit?: number,
  ): Promise<Category[]>;

  /**
   * Obtener categorías populares (por número de productos)
   */
  findPopularCategories(limit?: number): Promise<Category[]>;

  /**
   * Reordenar categorías
   */
  reorderCategories(categoryOrders: { id: string; sortOrder: number }[]): Promise<void>;
}