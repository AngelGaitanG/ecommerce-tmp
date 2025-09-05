import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { InventoryMovement, MovementType, MovementReason } from '../entities/inventory-movement.entity';
import { CreateInventoryMovementDto, UpdateInventoryMovementDto, InventoryMovementQueryDto } from '../dto';
import {
  IInventoryMovementRepository,
  MovementStats,
  StockAnalysis,
  MovementsByPeriod,
  PaginatedMovements
} from './inventory-movement-repository.interface';

@Injectable()
export class InventoryMovementRepository implements IInventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly repository: Repository<InventoryMovement>,
  ) {}

  // Operaciones CRUD básicas
  async create(createDto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = this.repository.create(createDto);
    return await this.repository.save(movement);
  }

  async findAll(query?: InventoryMovementQueryDto): Promise<PaginatedMovements> {
    const queryBuilder = this.buildQueryBuilder(query);
    
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    if (query?.sortBy) {
      const order = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`movement.${query.sortBy}`, order);
    } else {
      queryBuilder.orderBy('movement.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<InventoryMovement | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['product', 'variant']
    });
  }

  async update(id: string, updateDto: UpdateInventoryMovementDto): Promise<InventoryMovement> {
    await this.repository.update(id, updateDto);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error(`InventoryMovement with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Búsquedas específicas
  async findByProduct(productId: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.productId = :productId', { productId });
    return await queryBuilder.getMany();
  }

  async findByVariant(variantId: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.variantId = :variantId', { variantId });
    return await queryBuilder.getMany();
  }

  async findByType(type: MovementType, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.type = :type', { type });
    return await queryBuilder.getMany();
  }

  async findByReason(reason: MovementReason, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.reason = :reason', { reason });
    return await queryBuilder.getMany();
  }

  async findByLocation(location: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.location = :location', { location });
    return await queryBuilder.getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
      startDate,
      endDate
    });
    return await queryBuilder.getMany();
  }

  async findByExternalReference(reference: string, source?: string): Promise<InventoryMovement[]> {
    const queryBuilder = this.repository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.variant', 'variant')
      .where('movement.externalReference = :reference', { reference });
    
    if (source) {
      queryBuilder.andWhere('movement.externalSource = :source', { source });
    }
    
    return await queryBuilder.getMany();
  }

  async findPendingMovements(): Promise<InventoryMovement[]> {
    return await this.repository.find({
      where: { status: 'pending' },
      relations: ['product', 'variant'],
      order: { createdAt: 'ASC' }
    });
  }

  async findRecentMovements(limit: number = 10): Promise<InventoryMovement[]> {
    return await this.repository.find({
      relations: ['product', 'variant'],
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  // Análisis y reportes
  async getMovementStats(query?: InventoryMovementQueryDto): Promise<MovementStats> {
    const queryBuilder = this.buildQueryBuilder(query, false);
    
    const result = await queryBuilder
      .select([
        'COUNT(*) as totalMovements',
        'COUNT(CASE WHEN movement.type = :inbound THEN 1 END) as totalInbound',
        'COUNT(CASE WHEN movement.type = :outbound THEN 1 END) as totalOutbound', 
        'COUNT(CASE WHEN movement.type = :adjustment THEN 1 END) as totalAdjustments',
        'AVG(ABS(movement.quantity)) as averageQuantity',
        'SUM(ABS(movement.quantity) * movement.unitCost) as totalValue'
      ])
      .setParameters({
        inbound: MovementType.IN,
        outbound: MovementType.OUT,
        adjustment: MovementType.ADJUSTMENT
      })
      .getRawOne();

    return {
      totalMovements: parseInt(result.totalMovements) || 0,
      totalInbound: parseInt(result.totalInbound) || 0,
      totalOutbound: parseInt(result.totalOutbound) || 0,
      totalAdjustments: parseInt(result.totalAdjustments) || 0,
      averageQuantity: parseFloat(result.averageQuantity) || 0,
      totalValue: parseFloat(result.totalValue) || 0
    };
  }

  async getStockAnalysis(productId: string, variantId?: string): Promise<StockAnalysis> {
    const queryBuilder = this.repository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });
    
    if (variantId) {
      queryBuilder.andWhere('movement.variantId = :variantId', { variantId });
    }

    const result = await queryBuilder
      .select([
        'SUM(CASE WHEN movement.type = :inbound THEN movement.quantity ELSE 0 END) as totalInbound',
        'SUM(CASE WHEN movement.type = :outbound THEN ABS(movement.quantity) ELSE 0 END) as totalOutbound',
        'SUM(movement.quantity) as netMovement',
        'MAX(movement.createdAt) as lastMovementDate'
      ])
      .setParameters({
        inbound: MovementType.IN,
        outbound: MovementType.OUT
      })
      .getRawOne();

    const currentStock = await this.getCurrentStock(productId, variantId);

    return {
      productId,
      variantId,
      currentStock,
      totalInbound: parseInt(result.totalInbound) || 0,
      totalOutbound: parseInt(result.totalOutbound) || 0,
      netMovement: parseInt(result.netMovement) || 0,
      lastMovementDate: result.lastMovementDate || new Date()
    };
  }

  async getMovementsByPeriod(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date
  ): Promise<MovementsByPeriod[]> {
    const queryBuilder = this.repository.createQueryBuilder('movement');
    
    if (startDate && endDate) {
      queryBuilder.where('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    let dateFormat: string;
    switch (period) {
      case 'day':
        dateFormat = 'DATE(movement.createdAt)';
        break;
      case 'week':
        dateFormat = 'YEARWEEK(movement.createdAt)';
        break;
      case 'month':
        dateFormat = 'DATE_FORMAT(movement.createdAt, "%Y-%m")';
        break;
      case 'year':
        dateFormat = 'YEAR(movement.createdAt)';
        break;
    }

    const results = await queryBuilder
      .select([
        `${dateFormat} as period`,
        'COUNT(*) as movements',
        'SUM(ABS(movement.quantity)) as quantity',
        'SUM(ABS(movement.quantity) * movement.unitCost) as value'
      ])
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map(result => ({
      period: result.period,
      movements: parseInt(result.movements),
      quantity: parseInt(result.quantity),
      value: parseFloat(result.value)
    }));
  }

  async getTopMovedProducts(
    limit: number = 10,
    period?: { start: Date; end: Date }
  ): Promise<Array<{ productId: string; variantId?: string; totalQuantity: number; movementCount: number }>> {
    const queryBuilder = this.repository.createQueryBuilder('movement');
    
    if (period) {
      queryBuilder.where('movement.createdAt BETWEEN :start AND :end', period);
    }

    const results = await queryBuilder
      .select([
        'movement.productId as productId',
        'movement.variantId as variantId',
        'SUM(ABS(movement.quantity)) as totalQuantity',
        'COUNT(*) as movementCount'
      ])
      .groupBy('movement.productId, movement.variantId')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(result => ({
      productId: result.productId,
      variantId: result.variantId || undefined,
      totalQuantity: parseInt(result.totalQuantity),
      movementCount: parseInt(result.movementCount)
    }));
  }

  async getLowStockProducts(
    threshold: number = 10
  ): Promise<Array<{ productId: string; variantId?: string; currentStock: number; threshold: number }>> {
    // Esta implementación requeriría una consulta más compleja para calcular stock actual
    // Por simplicidad, retornamos un array vacío por ahora
    return [];
  }

  async getStockValueReport(): Promise<Array<{ productId: string; variantId?: string; quantity: number; unitCost: number; totalValue: number }>> {
    const results = await this.repository.createQueryBuilder('movement')
      .select([
        'movement.productId as productId',
        'movement.variantId as variantId',
        'SUM(movement.quantity) as quantity',
        'AVG(movement.unitCost) as unitCost'
      ])
      .groupBy('movement.productId, movement.variantId')
      .having('SUM(movement.quantity) > 0')
      .getRawMany();

    return results.map(result => {
      const quantity = parseInt(result.quantity);
      const unitCost = parseFloat(result.unitCost);
      return {
        productId: result.productId,
        variantId: result.variantId || undefined,
        quantity,
        unitCost,
        totalValue: quantity * unitCost
      };
    });
  }

  // Análisis de stock
  async getCurrentStock(productId: string, variantId?: string, location?: string): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });
    
    if (variantId) {
      queryBuilder.andWhere('movement.variantId = :variantId', { variantId });
    }
    
    if (location) {
      queryBuilder.andWhere('movement.location = :location', { location });
    }

    const result = await queryBuilder
      .select('SUM(movement.quantity) as totalStock')
      .getRawOne();

    return parseInt(result.totalStock) || 0;
  }

  async getStockHistory(
    productId: string,
    variantId?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; stock: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Esta implementación requeriría cálculos más complejos
    // Por simplicidad, retornamos un array vacío por ahora
    return [];
  }

  async getStockProjection(
    productId: string,
    variantId?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; projectedStock: number }>> {
    // Esta implementación requeriría algoritmos de predicción
    // Por simplicidad, retornamos un array vacío por ahora
    return [];
  }

  async validateStockAvailability(
    productId: string,
    variantId: string | undefined,
    quantity: number,
    location?: string
  ): Promise<boolean> {
    const currentStock = await this.getCurrentStock(productId, variantId, location);
    return currentStock >= quantity;
  }

  // Operaciones en lote
  async createBatch(movements: CreateInventoryMovementDto[]): Promise<InventoryMovement[]> {
    const entities = movements.map(dto => this.repository.create(dto));
    return await this.repository.save(entities);
  }

  async updateBatch(updates: Array<{ id: string; data: UpdateInventoryMovementDto }>): Promise<InventoryMovement[]> {
    const results: InventoryMovement[] = [];
    
    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }
    
    return results;
  }

  async removeBatch(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  // Utilidades
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async count(query?: InventoryMovementQueryDto): Promise<number> {
    const queryBuilder = this.buildQueryBuilder(query, false);
    return await queryBuilder.getCount();
  }

  async getLastMovement(productId: string, variantId?: string): Promise<InventoryMovement | null> {
    const queryBuilder = this.repository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId })
      .orderBy('movement.createdAt', 'DESC')
      .limit(1);
    
    if (variantId) {
      queryBuilder.andWhere('movement.variantId = :variantId', { variantId });
    }
    
    return await queryBuilder.getOne();
  }

  async calculateStockFromMovements(
    productId: string,
    variantId?: string,
    upToDate?: Date
  ): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });
    
    if (variantId) {
      queryBuilder.andWhere('movement.variantId = :variantId', { variantId });
    }
    
    if (upToDate) {
      queryBuilder.andWhere('movement.createdAt <= :upToDate', { upToDate });
    }

    const result = await queryBuilder
      .select('SUM(movement.quantity) as totalStock')
      .getRawOne();

    return parseInt(result.totalStock) || 0;
  }

  // Método auxiliar para construir query builder
  private buildQueryBuilder(query?: InventoryMovementQueryDto, includeRelations: boolean = true): SelectQueryBuilder<InventoryMovement> {
    const queryBuilder = this.repository.createQueryBuilder('movement');
    
    if (includeRelations) {
      queryBuilder
        .leftJoinAndSelect('movement.product', 'product')
        .leftJoinAndSelect('movement.variant', 'variant');
    }

    if (!query) return queryBuilder;

    if (query.productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId: query.productId });
    }

    // if (query.variantId) {
    //   queryBuilder.andWhere('movement.variantId = :variantId', { variantId: query.variantId });
    // }

    if (query.type) {
      queryBuilder.andWhere('movement.type = :type', { type: query.type });
    }

    if (query.reason) {
      queryBuilder.andWhere('movement.reason = :reason', { reason: query.reason });
    }

    if (query.location) {
      queryBuilder.andWhere('movement.location = :location', { location: query.location });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate
      });
    }

    if (query.performedBy) {
      queryBuilder.andWhere('movement.performedBy = :performedBy', { performedBy: query.performedBy });
    }

    return queryBuilder;
  }
}