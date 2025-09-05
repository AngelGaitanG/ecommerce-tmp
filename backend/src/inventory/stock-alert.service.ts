import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockAlert, AlertType, AlertPriority, AlertStatus } from './entities/stock-alert.entity';
import { StockAlertRepository } from './repositories/stock-alert.repository';
import {
  CreateStockAlertDto,
  UpdateStockAlertDto,
  StockAlertQueryDto,
  AcknowledgeAlertDto,
  ResolveAlertDto,
  DismissAlertDto
} from './dto';
import {
  AlertStats,
  AlertsByType,
  AlertsByPriority,
  PaginatedAlerts,
} from './repositories/stock-alert-repository.interface';

@Injectable()
export class StockAlertService {
  constructor(
    @InjectRepository(StockAlert)
    private readonly stockAlertRepository: StockAlertRepository,
  ) {}

  // Operaciones CRUD básicas
  async create(createStockAlertDto: CreateStockAlertDto): Promise<StockAlert> {
    try {
      // Verificar si ya existe una alerta similar activa
      const existingAlerts = await this.stockAlertRepository.findDuplicates(
        createStockAlertDto.productId,
        createStockAlertDto.productVariantId,
        createStockAlertDto.type
      );

      const activeAlert = existingAlerts.find(alert => 
        alert.status === AlertStatus.ACTIVE || alert.status === AlertStatus.ACKNOWLEDGED
      );

      if (activeAlert) {
        throw new BadRequestException(
          `Ya existe una alerta activa del tipo ${createStockAlertDto.type} para este producto`
        );
      }

      return await this.stockAlertRepository.create(createStockAlertDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear la alerta de stock: ${error.message}`);
    }
  }

  async findAll(query?: StockAlertQueryDto): Promise<PaginatedAlerts> {
    try {
      return await this.stockAlertRepository.findAll(query);
    } catch (error) {
      throw new BadRequestException(`Error al obtener las alertas: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<StockAlert> {
    try {
      const alert = await this.stockAlertRepository.findOne(id);
      if (!alert) {
        throw new NotFoundException(`Alerta de stock con ID ${id} no encontrada`);
      }
      return alert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener la alerta: ${error.message}`);
    }
  }

  async update(id: string, updateStockAlertDto: UpdateStockAlertDto): Promise<StockAlert> {
    try {
      const existingAlert = await this.findOne(id);
      return await this.stockAlertRepository.update(id, updateStockAlertDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar la alerta: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const existingAlert = await this.findOne(id);
      await this.stockAlertRepository.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar la alerta: ${error.message}`);
    }
  }

  // Búsquedas específicas
  async findByProduct(productId: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByProduct(productId, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por producto: ${error.message}`);
    }
  }

  async findByVariant(variantId: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByVariant(variantId, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por variante: ${error.message}`);
    }
  }

  async findByType(type: AlertType, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByType(type, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por tipo: ${error.message}`);
    }
  }

  async findByPriority(priority: AlertPriority, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByPriority(priority, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por prioridad: ${error.message}`);
    }
  }

  async findByStatus(status: AlertStatus, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByStatus(status, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por estado: ${error.message}`);
    }
  }

  async findByLocation(location: string, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findByLocation(location, query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas por ubicación: ${error.message}`);
    }
  }

  async findActive(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findActive(query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas activas: ${error.message}`);
    }
  }

  async findPending(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findPending(query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas pendientes: ${error.message}`);
    }
  }

  async findCritical(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findCritical(query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas críticas: ${error.message}`);
    }
  }

  async findExpired(query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findExpired(query);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas expiradas: ${error.message}`);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, query?: StockAlertQueryDto): Promise<StockAlert[]> {
    try {
      if (startDate > endDate) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
      }
      return await this.stockAlertRepository.findByDateRange(startDate, endDate, query);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar alertas por rango de fechas: ${error.message}`);
    }
  }

  // Gestión del ciclo de vida de alertas
  async acknowledge(id: string, dto: AcknowledgeAlertDto): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (alert.status !== AlertStatus.ACTIVE) {
        throw new BadRequestException('Solo se pueden reconocer alertas activas');
      }

      return await this.stockAlertRepository.acknowledge(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al reconocer la alerta: ${error.message}`);
    }
  }

  async resolve(id: string, dto: ResolveAlertDto): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (alert.status === AlertStatus.RESOLVED) {
        throw new BadRequestException('La alerta ya está resuelta');
      }

      if (alert.status === AlertStatus.DISMISSED) {
        throw new BadRequestException('No se puede resolver una alerta descartada');
      }

      return await this.stockAlertRepository.resolve(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al resolver la alerta: ${error.message}`);
    }
  }

  async dismiss(id: string, dto: DismissAlertDto): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (alert.status === AlertStatus.RESOLVED) {
        throw new BadRequestException('No se puede descartar una alerta resuelta');
      }

      if (alert.status === AlertStatus.DISMISSED) {
        throw new BadRequestException('La alerta ya está descartada');
      }

      return await this.stockAlertRepository.dismiss(id, dto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al descartar la alerta: ${error.message}`);
    }
  }

  async reactivate(id: string, reason?: string): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (alert.status === AlertStatus.ACTIVE || alert.status === AlertStatus.ACKNOWLEDGED) {
        throw new BadRequestException('La alerta ya está activa');
      }

      return await this.stockAlertRepository.reactivate(id, reason);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al reactivar la alerta: ${error.message}`);
    }
  }

  async snooze(id: string, until: Date, reason?: string): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (until <= new Date()) {
        throw new BadRequestException('La fecha de posposición debe ser futura');
      }

      if (alert.status !== AlertStatus.ACTIVE && alert.status !== AlertStatus.ACKNOWLEDGED) {
        throw new BadRequestException('Solo se pueden posponer alertas activas o reconocidas');
      }

      return await this.stockAlertRepository.snooze(id, until, reason);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al posponer la alerta: ${error.message}`);
    }
  }

  async escalate(id: string, newPriority: AlertPriority, reason?: string): Promise<StockAlert> {
    try {
      const alert = await this.findOne(id);
      
      if (alert.priority === AlertPriority.CRITICAL) {
        throw new BadRequestException('No se puede escalar una alerta que ya es crítica');
      }

      const priorityOrder = {
        [AlertPriority.LOW]: 1,
        [AlertPriority.MEDIUM]: 2,
        [AlertPriority.HIGH]: 3,
        [AlertPriority.CRITICAL]: 4
      };

      if (priorityOrder[newPriority] <= priorityOrder[alert.priority]) {
        throw new BadRequestException('La nueva prioridad debe ser mayor que la actual');
      }

      return await this.stockAlertRepository.escalate(id, newPriority, reason);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al escalar la alerta: ${error.message}`);
    }
  }

  // Análisis y reportes
  async getAlertStats(query?: StockAlertQueryDto): Promise<AlertStats> {
    try {
      return await this.stockAlertRepository.getAlertStats(query);
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas de alertas: ${error.message}`);
    }
  }

  async getAlertsByType(): Promise<AlertsByType[]> {
    try {
      return await this.stockAlertRepository.getAlertsByType();
    } catch (error) {
      throw new BadRequestException(`Error al obtener alertas por tipo: ${error.message}`);
    }
  }

  async getAlertsByPriority(): Promise<AlertsByPriority[]> {
    try {
      return await this.stockAlertRepository.getAlertsByPriority();
    } catch (error) {
      throw new BadRequestException(`Error al obtener alertas por prioridad: ${error.message}`);
    }
  }

  async getAlertTrends(days: number = 30): Promise<Array<{ date: Date; created: number; resolved: number; active: number }>> {
    try {
      if (days <= 0 || days > 365) {
        throw new BadRequestException('El número de días debe estar entre 1 y 365');
      }
      return await this.stockAlertRepository.getAlertTrends(days);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener tendencias de alertas: ${error.message}`);
    }
  }

  async getResponseTimeStats(): Promise<{ averageAcknowledgeTime: number; averageResolveTime: number; medianResolveTime: number }> {
    try {
      return await this.stockAlertRepository.getResponseTimeStats();
    } catch (error) {
      throw new BadRequestException(`Error al obtener tiempos de respuesta: ${error.message}`);
    }
  }

  async getTopAlertedProducts(limit: number = 10): Promise<Array<{ productId: string; variantId?: string; alertCount: number; lastAlertDate: Date }>> {
    try {
      if (limit <= 0 || limit > 100) {
        throw new BadRequestException('El límite debe estar entre 1 y 100');
      }
      return await this.stockAlertRepository.getTopAlertedProducts(limit);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener productos más alertados: ${error.message}`);
    }
  }

  // Gestión de notificaciones
  async findPendingNotifications(): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findPendingNotifications();
    } catch (error) {
      throw new BadRequestException(`Error al buscar notificaciones pendientes: ${error.message}`);
    }
  }

  async markNotificationSent(id: string, channel: string): Promise<void> {
    try {
      const alert = await this.findOne(id);
      await this.stockAlertRepository.markNotificationSent(id, channel);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al marcar notificación como enviada: ${error.message}`);
    }
  }

  async markNotificationFailed(id: string, channel: string, error: string): Promise<void> {
    try {
      const alert = await this.findOne(id);
      await this.stockAlertRepository.markNotificationFailed(id, channel, error);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al marcar notificación como fallida: ${error.message}`);
    }
  }

  async resetNotificationStatus(id: string): Promise<void> {
    try {
      const alert = await this.findOne(id);
      await this.stockAlertRepository.resetNotificationStatus(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al resetear estado de notificación: ${error.message}`);
    }
  }

  // Operaciones en lote
  async createBatch(createDtos: CreateStockAlertDto[]): Promise<StockAlert[]> {
    try {
      if (createDtos.length === 0) {
        throw new BadRequestException('La lista de alertas no puede estar vacía');
      }

      if (createDtos.length > 100) {
        throw new BadRequestException('No se pueden crear más de 100 alertas a la vez');
      }

      return await this.stockAlertRepository.createBatch(createDtos);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear alertas en lote: ${error.message}`);
    }
  }

  async updateBatch(updates: Array<{ id: string; data: UpdateStockAlertDto }>): Promise<StockAlert[]> {
    try {
      if (updates.length === 0) {
        throw new BadRequestException('La lista de actualizaciones no puede estar vacía');
      }

      if (updates.length > 100) {
        throw new BadRequestException('No se pueden actualizar más de 100 alertas a la vez');
      }

      return await this.stockAlertRepository.updateBatch(updates);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar alertas en lote: ${error.message}`);
    }
  }

  async removeBatch(ids: string[]): Promise<void> {
    try {
      if (ids.length === 0) {
        throw new BadRequestException('La lista de IDs no puede estar vacía');
      }

      if (ids.length > 100) {
        throw new BadRequestException('No se pueden eliminar más de 100 alertas a la vez');
      }

      await this.stockAlertRepository.removeBatch(ids);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar alertas en lote: ${error.message}`);
    }
  }

  async acknowledgeBatch(ids: string[], dto: AcknowledgeAlertDto): Promise<StockAlert[]> {
    try {
      if (ids.length === 0) {
        throw new BadRequestException('La lista de IDs no puede estar vacía');
      }

      return await this.stockAlertRepository.acknowledgeBatch(ids, dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al reconocer alertas en lote: ${error.message}`);
    }
  }

  async resolveBatch(ids: string[], dto: ResolveAlertDto): Promise<StockAlert[]> {
    try {
      if (ids.length === 0) {
        throw new BadRequestException('La lista de IDs no puede estar vacía');
      }

      return await this.stockAlertRepository.resolveBatch(ids, dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al resolver alertas en lote: ${error.message}`);
    }
  }

  async dismissBatch(ids: string[], dto: DismissAlertDto): Promise<StockAlert[]> {
    try {
      if (ids.length === 0) {
        throw new BadRequestException('La lista de IDs no puede estar vacía');
      }

      return await this.stockAlertRepository.dismissBatch(ids, dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al descartar alertas en lote: ${error.message}`);
    }
  }

  // Métodos de utilidad
  async exists(id: string): Promise<boolean> {
    try {
      return await this.stockAlertRepository.exists(id);
    } catch (error) {
      throw new BadRequestException(`Error al verificar existencia de alerta: ${error.message}`);
    }
  }

  async count(query?: StockAlertQueryDto): Promise<number> {
    try {
      return await this.stockAlertRepository.count(query);
    } catch (error) {
      throw new BadRequestException(`Error al contar alertas: ${error.message}`);
    }
  }

  async findDuplicates(productId: string, variantId?: string, type?: AlertType): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.findDuplicates(productId, variantId, type);
    } catch (error) {
      throw new BadRequestException(`Error al buscar alertas duplicadas: ${error.message}`);
    }
  }

  async cleanupExpiredAlerts(olderThanDays?: number): Promise<number> {
    try {
      return await this.stockAlertRepository.cleanupExpiredAlerts(olderThanDays);
    } catch (error) {
      throw new BadRequestException(`Error al limpiar alertas expiradas: ${error.message}`);
    }
  }

  async autoResolveAlerts(productId: string, variantId?: string): Promise<StockAlert[]> {
    try {
      return await this.stockAlertRepository.autoResolveAlerts(productId, variantId);
    } catch (error) {
      throw new BadRequestException(`Error al resolver alertas automáticamente: ${error.message}`);
    }
  }

  // Métodos de conveniencia para tipos específicos de alertas
  async createLowStockAlert(productId: string, productVariantId: string, currentStock: number, thresholdValue: number, location?: string): Promise<StockAlert> {
    const createDto: CreateStockAlertDto = {
      productId,
      productVariantId,
      type: AlertType.LOW_STOCK,
      priority: currentStock <= thresholdValue * 0.5 ? AlertPriority.HIGH : AlertPriority.MEDIUM,
      status: AlertStatus.ACTIVE,
      currentStock,
      thresholdValue,
      location,
      title: 'Stock Bajo',
      description: `El stock actual (${currentStock}) está por debajo del umbral (${thresholdValue})`,
      actionRequired: 'Reabastecer inventario'
    };

    return await this.create(createDto);
  }

  async createOutOfStockAlert(productId: string, productVariantId: string, location?: string): Promise<StockAlert> {
    const createDto: CreateStockAlertDto = {
      productId,
      productVariantId,
      type: AlertType.OUT_OF_STOCK,
      priority: AlertPriority.CRITICAL,
      status: AlertStatus.ACTIVE,
      currentStock: 0,
      thresholdValue: 1,
      location,
      title: 'Sin Stock',
      description: 'El producto está completamente agotado',
      actionRequired: 'Reabastecer urgentemente'
    };

    return await this.create(createDto);
  }

  async createExpirationAlert(productId: string, productVariantId: string, expirationDate: Date, location?: string): Promise<StockAlert> {
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const createDto: CreateStockAlertDto = {
      productId,
      productVariantId,
      type: AlertType.EXPIRING_SOON,
      priority: daysUntilExpiration <= 7 ? AlertPriority.HIGH : AlertPriority.MEDIUM,
      status: AlertStatus.ACTIVE,
      currentStock: 0, // Se actualizará con el stock real
      thresholdValue: daysUntilExpiration,
      location,
      title: 'Próximo a Vencer',
      description: `El producto vence en ${daysUntilExpiration} días`,
      actionRequired: 'Revisar y gestionar productos próximos a vencer',
      expirationDate: expirationDate.toISOString()
    };

    return await this.create(createDto);
  }
}