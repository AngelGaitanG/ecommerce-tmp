import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { StockAlert, AlertType, AlertPriority, AlertStatus } from '../entities/stock-alert.entity';
import { 
  CreateStockAlertDto, 
  UpdateStockAlertDto, 
  StockAlertQueryDto, 
  AcknowledgeAlertDto, 
  ResolveAlertDto, 
  DismissAlertDto 
} from '../dto';
import {
  IStockAlertRepository,
  AlertStats,
  AlertsByType,
  AlertsByPriority,
  PaginatedAlerts
} from './stock-alert-repository.interface';

@Injectable()
export class StockAlertRepository implements IStockAlertRepository {
  constructor(
    @InjectRepository(StockAlert)
    private readonly repository: Repository<StockAlert>,
  ) {}

  // Operaciones CRUD básicas
  async create(createDto: CreateStockAlertDto): Promise<StockAlert> {
    const alert = this.repository.create({
      ...createDto,
      expirationDate: createDto.expirationDate ? new Date(createDto.expirationDate) : undefined
    });
    return await this.repository.save(alert);
  }

  async findAll(query?: StockAlertQueryDto): Promise<PaginatedAlerts> {
    const queryBuilder = this.buildQueryBuilder(query);
    
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    if (query?.sortBy) {
      const order = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`alert.${query.sortBy}`, order);
    } else {
      queryBuilder.orderBy('alert.createdAt', 'DESC');
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

  async findOne(id: string): Promise<StockAlert | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['product', 'productVariant']
    });
  }

  async update(id: string, updateDto: UpdateStockAlertDto): Promise<StockAlert> {
    const updateData = {
      ...updateDto,
      expirationDate: updateDto.expirationDate ? new Date(updateDto.expirationDate) : undefined
    };
    
    await this.repository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error(`StockAlert with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Búsquedas específicas
  async findByProduct(productId: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.productId = :productId', { productId });
    return await queryBuilder.getMany();
  }

  async findByVariant(variantId: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.productVariantId = :variantId', { variantId });
    return await queryBuilder.getMany();
  }

  async findByType(type: AlertType, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.type = :type', { type });
    return await queryBuilder.getMany();
  }

  async findByPriority(priority: AlertPriority, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.priority = :priority', { priority });
    return await queryBuilder.getMany();
  }

  async findByStatus(status: AlertStatus, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.status = :status', { status });
    return await queryBuilder.getMany();
  }

  async findByLocation(location: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.location = :location', { location });
    return await queryBuilder.getMany();
  }

  async findActive(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.status = :status', { status: AlertStatus.ACTIVE });
    return await queryBuilder.getMany();
  }

  async findPending(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.status IN (:...statuses)', { 
      statuses: [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED] 
    });
    return await queryBuilder.getMany();
  }

  async findCritical(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.priority = :priority', { priority: AlertPriority.CRITICAL });
    return await queryBuilder.getMany();
  }

  async findExpired(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.expirationDate < :now', { now: new Date() });
    return await queryBuilder.getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    const queryBuilder = this.buildQueryBuilder(query);
    queryBuilder.andWhere('alert.createdAt BETWEEN :startDate AND :endDate', {
      startDate,
      endDate
    });
    return await queryBuilder.getMany();
  }

  // Gestión del ciclo de vida de alertas
  async acknowledge(id: string, dto: AcknowledgeAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    alert.acknowledge(dto.acknowledgedBy);
    if (dto.notes) {
      alert.notes = dto.notes;
    }

    return await this.repository.save(alert);
  }

  async resolve(id: string, dto: ResolveAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    alert.resolve(dto.resolvedBy, dto.notes);

    return await this.repository.save(alert);
  }

  async dismiss(id: string, dto: DismissAlertDto): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    alert.dismiss(dto.dismissedBy, dto.reason);

    return await this.repository.save(alert);
  }

  async reactivate(id: string, reason?: string): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    alert.status = AlertStatus.ACTIVE;
    alert.acknowledgedAt = null;
    alert.resolvedAt = null;
    alert.dismissedAt = null;
    alert.acknowledgedBy = null;
    alert.resolvedBy = null;
    alert.dismissedBy = null;
    
    if (reason) {
      alert.notes = reason;
    }

    return await this.repository.save(alert);
  }

  async snooze(id: string, until: Date, reason?: string): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    // Implementar lógica de snooze usando metadata
    alert.metadata = {
      ...alert.metadata,
      snoozedUntil: until.toISOString(),
      snoozeReason: reason
    };

    return await this.repository.save(alert);
  }

  async escalate(id: string, newPriority: AlertPriority, reason?: string): Promise<StockAlert> {
    const alert = await this.findOne(id);
    if (!alert) {
      throw new Error(`StockAlert with id ${id} not found`);
    }

    const oldPriority = alert.priority;
    alert.priority = newPriority;
    
    if (reason) {
      alert.notes = `Escalated from ${oldPriority} to ${newPriority}: ${reason}`;
    }

    return await this.repository.save(alert);
  }

  // Análisis y reportes
  async getAlertStats(query?: StockAlertQueryDto): Promise<AlertStats> {
    const queryBuilder = this.buildQueryBuilder(query, false);
    
    const result = await queryBuilder
      .select([
        'COUNT(*) as totalAlerts',
        'COUNT(CASE WHEN alert.status = :active THEN 1 END) as activeAlerts',
        'COUNT(CASE WHEN alert.status = :acknowledged THEN 1 END) as acknowledgedAlerts',
        'COUNT(CASE WHEN alert.status = :resolved THEN 1 END) as resolvedAlerts',
        'COUNT(CASE WHEN alert.status = :dismissed THEN 1 END) as dismissedAlerts',
        'COUNT(CASE WHEN alert.priority = :critical THEN 1 END) as criticalAlerts',
        'COUNT(CASE WHEN alert.priority = :high THEN 1 END) as highPriorityAlerts'
      ])
      .setParameters({
        active: AlertStatus.ACTIVE,
        acknowledged: AlertStatus.ACKNOWLEDGED,
        resolved: AlertStatus.RESOLVED,
        dismissed: AlertStatus.DISMISSED,
        critical: AlertPriority.CRITICAL,
        high: AlertPriority.HIGH
      })
      .getRawOne();

    return {
      totalAlerts: parseInt(result.totalAlerts) || 0,
      activeAlerts: parseInt(result.activeAlerts) || 0,
      acknowledgedAlerts: parseInt(result.acknowledgedAlerts) || 0,
      resolvedAlerts: parseInt(result.resolvedAlerts) || 0,
      dismissedAlerts: parseInt(result.dismissedAlerts) || 0,
      criticalAlerts: parseInt(result.criticalAlerts) || 0,
      highPriorityAlerts: parseInt(result.highPriorityAlerts) || 0
    };
  }

  async getAlertsByType(): Promise<AlertsByType[]> {
    const result = await this.repository
      .createQueryBuilder('alert')
      .select([
        'alert.type as type',
        'COUNT(*) as count',
        'COUNT(CASE WHEN alert.status = :active THEN 1 END) as activeCount'
      ])
      .setParameter('active', AlertStatus.ACTIVE)
      .groupBy('alert.type')
      .getRawMany();

    return result.map(row => ({
      type: row.type,
      count: parseInt(row.count),
      activeCount: parseInt(row.activeCount)
    }));
  }

  async getAlertsByPriority(): Promise<AlertsByPriority[]> {
    const result = await this.repository
      .createQueryBuilder('alert')
      .select([
        'alert.priority as priority',
        'COUNT(*) as count',
        'COUNT(CASE WHEN alert.status = :active THEN 1 END) as activeCount'
      ])
      .setParameter('active', AlertStatus.ACTIVE)
      .groupBy('alert.priority')
      .getRawMany();

    return result.map(row => ({
      priority: row.priority,
      count: parseInt(row.count),
      activeCount: parseInt(row.activeCount)
    }));
  }

  async getAlertTrends(days: number = 30): Promise<Array<{ date: Date; created: number; resolved: number; active: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.repository
      .createQueryBuilder('alert')
      .select([
        'DATE(alert.createdAt) as date',
        'COUNT(*) as created',
        'COUNT(CASE WHEN alert.status = :resolved THEN 1 END) as resolved',
        'COUNT(CASE WHEN alert.status = :active THEN 1 END) as active'
      ])
      .where('alert.createdAt >= :startDate', { startDate })
      .setParameter('resolved', AlertStatus.RESOLVED)
      .setParameter('active', AlertStatus.ACTIVE)
      .groupBy('DATE(alert.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map(row => ({
      date: new Date(row.date),
      created: parseInt(row.created),
      resolved: parseInt(row.resolved),
      active: parseInt(row.active)
    }));
  }

  async getResponseTimeStats(): Promise<{ averageAcknowledgeTime: number; averageResolveTime: number; medianResolveTime: number }> {
    const acknowledgeResult = await this.repository
      .createQueryBuilder('alert')
      .select('AVG(TIMESTAMPDIFF(HOUR, alert.createdAt, alert.acknowledgedAt)) as avgTime')
      .where('alert.acknowledgedAt IS NOT NULL')
      .getRawOne();

    const resolveResult = await this.repository
      .createQueryBuilder('alert')
      .select([
        'AVG(TIMESTAMPDIFF(HOUR, alert.createdAt, alert.resolvedAt)) as avgTime',
        'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TIMESTAMPDIFF(HOUR, alert.createdAt, alert.resolvedAt)) as medianTime'
      ])
      .where('alert.resolvedAt IS NOT NULL')
      .getRawOne();

    return {
      averageAcknowledgeTime: parseFloat(acknowledgeResult?.avgTime) || 0,
      averageResolveTime: parseFloat(resolveResult?.avgTime) || 0,
      medianResolveTime: parseFloat(resolveResult?.medianTime) || 0
    };
  }

  async getTopAlertedProducts(limit: number = 10): Promise<Array<{ productId: string; variantId?: string; alertCount: number; lastAlertDate: Date }>> {
    const result = await this.repository
      .createQueryBuilder('alert')
      .select([
        'alert.productId as productId',
        'alert.productVariantId as variantId',
        'COUNT(*) as alertCount',
        'MAX(alert.createdAt) as lastAlertDate'
      ])
      .groupBy('alert.productId, alert.productVariantId')
      .orderBy('alertCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(row => ({
      productId: row.productId,
      variantId: row.variantId,
      alertCount: parseInt(row.alertCount),
      lastAlertDate: new Date(row.lastAlertDate)
    }));
  }

  // Notificaciones
  async findPendingNotifications(): Promise<StockAlert[]> {
    return await this.repository.find({
      where: {
        status: AlertStatus.ACTIVE,
        emailSent: false
      },
      relations: ['product', 'productVariant'],
      order: { createdAt: 'ASC' }
    });
  }

  async markNotificationSent(id: string, channel: string): Promise<void> {
    const updateData: any = {};
    
    switch (channel) {
      case 'email':
        updateData.emailSent = true;
        break;
      case 'sms':
        updateData.smsSent = true;
        break;
      case 'push':
        updateData.pushNotificationSent = true;
        break;
    }

    await this.repository.update(id, updateData);
  }

  async markNotificationFailed(id: string, channel: string, error: string): Promise<void> {
    const alert = await this.findOne(id);
    if (alert) {
      alert.metadata = {
        ...alert.metadata,
        notificationErrors: {
          ...alert.metadata?.notificationErrors,
          [channel]: error
        }
      };
      await this.repository.save(alert);
    }
  }

  async resetNotificationStatus(id: string): Promise<void> {
    await this.repository.update(id, {
      emailSent: false,
      smsSent: false,
      pushNotificationSent: false
    });
  }

  // Operaciones en lote
  async createBatch(alerts: CreateStockAlertDto[]): Promise<StockAlert[]> {
    const entities = alerts.map(dto => this.repository.create({
      ...dto,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined
    }));
    return await this.repository.save(entities);
  }

  async updateBatch(updates: Array<{ id: string; data: UpdateStockAlertDto }>): Promise<StockAlert[]> {
    const results: StockAlert[] = [];
    
    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }
    
    return results;
  }

  async removeBatch(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  async acknowledgeBatch(ids: string[], dto: AcknowledgeAlertDto): Promise<StockAlert[]> {
    const results: StockAlert[] = [];
    
    for (const id of ids) {
      const acknowledged = await this.acknowledge(id, dto);
      results.push(acknowledged);
    }
    
    return results;
  }

  async resolveBatch(ids: string[], dto: ResolveAlertDto): Promise<StockAlert[]> {
    const results: StockAlert[] = [];
    
    for (const id of ids) {
      const resolved = await this.resolve(id, dto);
      results.push(resolved);
    }
    
    return results;
  }

  async dismissBatch(ids: string[], dto: DismissAlertDto): Promise<StockAlert[]> {
    const results: StockAlert[] = [];
    
    for (const id of ids) {
      const dismissed = await this.dismiss(id, dto);
      results.push(dismissed);
    }
    
    return results;
  }

  // Utilidades
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async count(query?: StockAlertQueryDto): Promise<number> {
    const queryBuilder = this.buildQueryBuilder(query, false);
    return await queryBuilder.getCount();
  }

  async findDuplicates(productId: string, variantId?: string, type?: AlertType): Promise<StockAlert[]> {
    const queryBuilder = this.repository.createQueryBuilder('alert')
      .where('alert.productId = :productId', { productId })
      .andWhere('alert.status = :status', { status: AlertStatus.ACTIVE });

    if (variantId) {
      queryBuilder.andWhere('alert.productVariantId = :variantId', { variantId });
    }

    if (type) {
      queryBuilder.andWhere('alert.type = :type', { type });
    }

    return await queryBuilder.getMany();
  }

  async cleanupExpiredAlerts(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', { 
        statuses: [AlertStatus.RESOLVED, AlertStatus.DISMISSED] 
      })
      .andWhere('updatedAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async autoResolveAlerts(productId: string, variantId?: string): Promise<StockAlert[]> {
    const queryBuilder = this.repository.createQueryBuilder('alert')
      .where('alert.productId = :productId', { productId })
      .andWhere('alert.status = :status', { status: AlertStatus.ACTIVE })
      .andWhere('alert.type IN (:...types)', { 
        types: [AlertType.LOW_STOCK, AlertType.OUT_OF_STOCK] 
      });

    if (variantId) {
      queryBuilder.andWhere('alert.productVariantId = :variantId', { variantId });
    }

    const alerts = await queryBuilder.getMany();
    
    for (const alert of alerts) {
      alert.resolve('system', 'Auto-resolved due to stock replenishment');
    }

    return await this.repository.save(alerts);
  }

  // Método auxiliar para construir query builder
  private buildQueryBuilder(query?: StockAlertQueryDto, includeRelations: boolean = true): SelectQueryBuilder<StockAlert> {
    const queryBuilder = this.repository.createQueryBuilder('alert');

    if (includeRelations) {
      queryBuilder
        .leftJoinAndSelect('alert.product', 'product')
        .leftJoinAndSelect('alert.productVariant', 'productVariant');
    }

    if (!query) {
      return queryBuilder;
    }

    if (query.productId) {
      queryBuilder.andWhere('alert.productId = :productId', { productId: query.productId });
    }

    if (query.productVariantId) {
      queryBuilder.andWhere('alert.productVariantId = :productVariantId', { productVariantId: query.productVariantId });
    }

    if (query.type) {
      queryBuilder.andWhere('alert.type = :type', { type: query.type });
    }

    if (query.priority) {
      queryBuilder.andWhere('alert.priority = :priority', { priority: query.priority });
    }

    if (query.status) {
      queryBuilder.andWhere('alert.status = :status', { status: query.status });
    }

    if (query.location) {
      queryBuilder.andWhere('alert.location = :location', { location: query.location });
    }

    if (query.startDate) {
      queryBuilder.andWhere('alert.createdAt >= :startDate', { startDate: new Date(query.startDate) });
    }

    if (query.endDate) {
      queryBuilder.andWhere('alert.createdAt <= :endDate', { endDate: new Date(query.endDate) });
    }

    if (query.isExpired !== undefined) {
      if (query.isExpired) {
        queryBuilder.andWhere('alert.expirationDate < :now', { now: new Date() });
      } else {
        queryBuilder.andWhere('(alert.expirationDate IS NULL OR alert.expirationDate >= :now)', { now: new Date() });
      }
    }

    return queryBuilder;
  }
}