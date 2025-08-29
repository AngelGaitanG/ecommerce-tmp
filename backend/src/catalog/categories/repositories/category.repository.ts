import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, SelectQueryBuilder } from 'typeorm';
import { Category } from '../entities/category.entity';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
    @InjectRepository(Category)
    private readonly treeRepository: TreeRepository<Category>,
  ) {}

  /**
   * Crear una nueva categoría
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.repository.create(createCategoryDto);
    return await this.repository.save(category);
  }

  /**
   * Buscar categoría por ID con relaciones opcionales
   */
  async findById(
    id: string,
    includeParent: boolean = false,
    includeChildren: boolean = false,
  ): Promise<Category | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.id = :id', { id });

    if (includeParent) {
      queryBuilder.leftJoinAndSelect('category.parent', 'parent');
    }

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    return await queryBuilder.getOne();
  }

  /**
   * Buscar categoría por slug
   */
  async findBySlug(
    slug: string,
    includeParent: boolean = false,
    includeChildren: boolean = false,
  ): Promise<Category | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.slug = :slug', { slug });

    if (includeParent) {
      queryBuilder.leftJoinAndSelect('category.parent', 'parent');
    }

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    return await queryBuilder.getOne();
  }

  /**
   * Verificar si existe una categoría con el mismo slug
   */
  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.slug = :slug', { slug });

    if (excludeId) {
      queryBuilder.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Buscar categorías con filtros y paginación
   */
  async findWithFilters(queryDto: QueryCategoryDto): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      parentId,
      rootOnly,
      sortBy = 'sortOrder',
      sortOrder = 'ASC',
      includeChildren,
      includeParent,
    } = queryDto;

    const queryBuilder = this.buildFilterQuery(
      search,
      isActive,
      parentId,
      rootOnly,
      includeChildren,
      includeParent,
    );

    // Ordenamiento
    queryBuilder.orderBy(`category.${sortBy}`, sortOrder);

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Obtener todas las categorías raíz (sin padre)
   */
  async findRootCategories(
    isActive?: boolean,
    includeChildren: boolean = false,
  ): Promise<Category[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.parentId IS NULL')
      .orderBy('category.sortOrder', 'ASC');

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    return await queryBuilder.getMany();
  }

  /**
   * Obtener subcategorías de una categoría padre
   */
  async findChildren(
    parentId: string,
    isActive?: boolean,
    includeChildren: boolean = false,
  ): Promise<Category[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.parentId = :parentId', { parentId })
      .orderBy('category.sortOrder', 'ASC');

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    return await queryBuilder.getMany();
  }

  /**
   * Obtener el árbol completo de categorías usando TypeORM Tree
   */
  async findTree(isActive?: boolean): Promise<Category[]> {
    let categories: Category[];

    if (isActive !== undefined) {
      // Si necesitamos filtrar por estado, usamos query builder
      const queryBuilder = this.repository
        .createQueryBuilder('category')
        .where('category.isActive = :isActive', { isActive })
        .orderBy('category.sortOrder', 'ASC');
      
      categories = await queryBuilder.getMany();
      
      // Construir manualmente el árbol
      return this.buildTree(categories);
    } else {
      // Usar el método nativo de TypeORM para obtener el árbol
      return await this.treeRepository.findTrees();
    }
  }

  /**
   * Obtener todos los ancestros de una categoría
   */
  async findAncestors(category: Category): Promise<Category[]> {
    return await this.treeRepository.findAncestors(category);
  }

  /**
   * Obtener todos los descendientes de una categoría
   */
  async findDescendants(category: Category): Promise<Category[]> {
    return await this.treeRepository.findDescendants(category);
  }

  /**
   * Actualizar una categoría
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    await this.repository.update(id, updateCategoryDto);
    return await this.findById(id);
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  /**
   * Eliminar permanentemente una categoría
   */
  async hardRemove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Verificar si una categoría tiene subcategorías
   */
  async hasChildren(id: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('category')
      .where('category.parentId = :id', { id })
      .getCount();
    
    return count > 0;
  }

  /**
   * Obtener el conteo de categorías por filtros
   */
  async countByFilters(
    search?: string,
    isActive?: boolean,
    parentId?: string,
    rootOnly?: boolean,
  ): Promise<number> {
    const queryBuilder = this.buildFilterQuery(search, isActive, parentId, rootOnly);
    return await queryBuilder.getCount();
  }

  /**
   * Buscar categorías por nombre (búsqueda parcial)
   */
  async searchByName(
    name: string,
    isActive?: boolean,
    limit: number = 10,
  ): Promise<Category[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.name ILIKE :name', { name: `%${name}%` })
      .orderBy('category.name', 'ASC')
      .take(limit);

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Obtener categorías populares (por número de productos)
   */
  async findPopularCategories(limit: number = 10): Promise<Category[]> {
    return await this.repository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .addSelect('COUNT(product.id)', 'productCount')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('productCount', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(categoryOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { id, sortOrder } of categoryOrders) {
        await queryRunner.manager.update(Category, id, { sortOrder });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Construir query base para filtros
   */
  private buildFilterQuery(
    search?: string,
    isActive?: boolean,
    parentId?: string,
    rootOnly?: boolean,
    includeChildren?: boolean,
    includeParent?: boolean,
  ): SelectQueryBuilder<Category> {
    const queryBuilder = this.repository.createQueryBuilder('category');

    // Incluir relaciones
    if (includeParent) {
      queryBuilder.leftJoinAndSelect('category.parent', 'parent');
    }

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (parentId) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    }

    if (rootOnly) {
      queryBuilder.andWhere('category.parentId IS NULL');
    }

    return queryBuilder;
  }

  /**
   * Construir árbol jerárquico manualmente
   */
  private buildTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Crear mapa de categorías - usar las instancias originales
    categories.forEach(category => {
      // Inicializar children como array vacío si no existe
      if (!category.children) {
        category.children = [];
      }
      categoryMap.set(category.id, category);
    });

    // Construir relaciones padre-hijo
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }
}