import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement, MovementType, MovementReason } from './entities/inventory-movement.entity';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { InventoryMovementQueryDto } from './dto/inventory-movement-query.dto';
import {
  PaginatedMovements,
  MovementStats,
  StockAnalysis,
  MovementsByPeriod
} from './repositories/inventory-movement-repository.interface';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementEntityRepository: Repository<InventoryMovement>,
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  // CRUD básico
  async createMovement(createMovementDto: CreateInventoryMovementDto): Promise<InventoryMovement> {
    try {
      // Validar que la cantidad sea positiva
      if (createMovementDto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero');
      }

      // Validar que previousStock y newStock sean consistentes
      const expectedNewStock = createMovementDto.type === MovementType.IN 
        ? createMovementDto.previousStock + createMovementDto.quantity
        : createMovementDto.previousStock - createMovementDto.quantity;
      
      if (Math.abs(createMovementDto.newStock - expectedNewStock) > 0.01) {
        throw new BadRequestException('New stock calculation is inconsistent with movement type and quantity');
      }

      // Validar stock para movimientos de salida
      if (createMovementDto.type === MovementType.OUT && createMovementDto.previousStock < createMovementDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${createMovementDto.previousStock}, Requested: ${createMovementDto.quantity}`
        );
      }

      // Validar precios si se proporcionan
      if (createMovementDto.unitCost !== undefined && createMovementDto.unitCost < 0) {
        throw new BadRequestException('Unit cost cannot be negative');
      }

      if (createMovementDto.totalCost !== undefined && createMovementDto.totalCost < 0) {
        throw new BadRequestException('Total cost cannot be negative');
      }

      return await this.inventoryMovementRepository.create(createMovementDto);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create inventory movement: ' + error.message);
    }
  }

  async findAllMovements(queryDto?: InventoryMovementQueryDto): Promise<PaginatedMovements> {
    try {
      return await this.inventoryMovementRepository.findAll(queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve inventory movements: ' + error.message);
    }
  }

  async findMovementById(id: string): Promise<InventoryMovement> {
    try {
      const movement = await this.inventoryMovementRepository.findOne(id);
      
      if (!movement) {
        throw new NotFoundException(`Inventory movement with ID '${id}' not found`);
      }
      
      return movement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve inventory movement: ' + error.message);
    }
  }

  async updateMovement(id: string, updateMovementDto: UpdateInventoryMovementDto): Promise<InventoryMovement> {
    try {
      // Verificar que el movimiento existe
      const existingMovement = await this.inventoryMovementRepository.findOne(id);
      if (!existingMovement) {
        throw new NotFoundException(`Inventory movement with ID '${id}' not found`);
      }

      // Validar cantidad si se está actualizando
      if (updateMovementDto.quantity !== undefined && updateMovementDto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero');
      }

      // Validar precios si se están actualizando
      if (updateMovementDto.unitCost !== undefined && updateMovementDto.unitCost < 0) {
        throw new BadRequestException('Unit cost cannot be negative');
      }

      if (updateMovementDto.totalCost !== undefined && updateMovementDto.totalCost < 0) {
        throw new BadRequestException('Total cost cannot be negative');
      }

      return await this.inventoryMovementRepository.update(id, updateMovementDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update inventory movement: ' + error.message);
    }
  }

  async deleteMovement(id: string): Promise<void> {
    try {
      const movement = await this.inventoryMovementRepository.findOne(id);
      if (!movement) {
        throw new NotFoundException(`Inventory movement with ID '${id}' not found`);
      }

      await this.inventoryMovementRepository.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete inventory movement: ' + error.message);
    }
  }

  // Búsquedas específicas
  async findMovementsByProduct(productId: string, queryDto?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByProduct(productId, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by product: ' + error.message);
    }
  }

  async findMovementsByVariant(variantId: string, queryDto?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByVariant(variantId, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by variant: ' + error.message);
    }
  }

  async findMovementsByType(type: MovementType, queryDto?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByType(type, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by type: ' + error.message);
    }
  }

  async findMovementsByReason(reason: MovementReason, queryDto?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByReason(reason, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by reason: ' + error.message);
    }
  }

  async findMovementsByLocation(location: string, queryDto?: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByLocation(location, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by location: ' + error.message);
    }
  }

  async findMovementsByDateRange(
    startDate: Date,
    endDate: Date,
    queryDto?: InventoryMovementQueryDto
  ): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByDateRange(startDate, endDate, queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by date range: ' + error.message);
    }
  }

  async findMovementsByExternalReference(reference: string, source?: string): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findByExternalReference(reference, source);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by external reference: ' + error.message);
    }
  }

  async findPendingMovements(): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findPendingMovements();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve pending movements: ' + error.message);
    }
  }

  async findRecentMovements(limit: number = 10): Promise<InventoryMovement[]> {
    try {
      return await this.inventoryMovementRepository.findRecentMovements(limit);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve recent movements: ' + error.message);
    }
  }

  // Análisis y reportes
  async getMovementStats(queryDto?: InventoryMovementQueryDto): Promise<MovementStats> {
    try {
      return await this.inventoryMovementRepository.getMovementStats(queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movement statistics: ' + error.message);
    }
  }

  async getStockAnalysis(productId: string, variantId?: string): Promise<StockAnalysis> {
    try {
      return await this.inventoryMovementRepository.getStockAnalysis(productId, variantId);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve stock analysis: ' + error.message);
    }
  }

  async getMovementsByPeriod(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date
  ): Promise<MovementsByPeriod[]> {
    try {
      return await this.inventoryMovementRepository.getMovementsByPeriod(period, startDate, endDate);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve movements by period: ' + error.message);
    }
  }

  async getTopMovedProducts(
    limit: number = 10,
    period?: { start: Date; end: Date }
  ): Promise<Array<{ productId: string; variantId?: string; totalQuantity: number; movementCount: number }>> {
    try {
      return await this.inventoryMovementRepository.getTopMovedProducts(limit, period);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve top moved products: ' + error.message);
    }
  }

  async getLowStockProducts(
    threshold: number = 10
  ): Promise<Array<{ productId: string; variantId?: string; currentStock: number; threshold: number }>> {
    try {
      return await this.inventoryMovementRepository.getLowStockProducts(threshold);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve low stock products: ' + error.message);
    }
  }

  async getStockValueReport(): Promise<Array<{ productId: string; variantId?: string; quantity: number; unitCost: number; totalValue: number }>> {
    try {
      return await this.inventoryMovementRepository.getStockValueReport();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve stock value report: ' + error.message);
    }
  }

  // Análisis de stock
  async getCurrentStock(productId: string, variantId?: string, location?: string): Promise<number> {
    try {
      return await this.inventoryMovementRepository.getCurrentStock(productId, variantId, location);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve current stock: ' + error.message);
    }
  }

  async getStockHistory(
    productId: string,
    variantId?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; stock: number }>> {
    try {
      return await this.inventoryMovementRepository.getStockHistory(productId, variantId, days);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve stock history: ' + error.message);
    }
  }

  async getStockProjection(
    productId: string,
    variantId?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; projectedStock: number }>> {
    try {
      return await this.inventoryMovementRepository.getStockProjection(productId, variantId, days);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve stock projection: ' + error.message);
    }
  }

  async validateStockAvailability(
    productId: string,
    variantId: string | undefined,
    quantity: number,
    location?: string
  ): Promise<boolean> {
    try {
      return await this.inventoryMovementRepository.validateStockAvailability(
        productId,
        variantId,
        quantity,
        location
      );
    } catch (error) {
      throw new BadRequestException('Failed to validate stock availability: ' + error.message);
    }
  }

  // Operaciones en lote
  async createBulkMovements(movements: CreateInventoryMovementDto[]): Promise<InventoryMovement[]> {
    try {
      // Validar cada movimiento antes de crear
      for (const movement of movements) {
        if (movement.quantity <= 0) {
          throw new BadRequestException('All quantities must be greater than zero');
        }
        
        if (movement.unitCost !== undefined && movement.unitCost < 0) {
          throw new BadRequestException('Unit costs cannot be negative');
        }
        
        if (movement.totalCost !== undefined && movement.totalCost < 0) {
          throw new BadRequestException('Total costs cannot be negative');
        }
      }

      return await this.inventoryMovementRepository.createBatch(movements);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create bulk movements: ' + error.message);
    }
  }

  async updateBulkMovements(
    updates: Array<{ id: string; data: UpdateInventoryMovementDto }>
  ): Promise<InventoryMovement[]> {
    try {
      // Validar datos de actualización
      for (const update of updates) {
        if (update.data.quantity !== undefined && update.data.quantity <= 0) {
          throw new BadRequestException('All quantities must be greater than zero');
        }
        
        if (update.data.unitCost !== undefined && update.data.unitCost < 0) {
          throw new BadRequestException('Unit costs cannot be negative');
        }
        
        if (update.data.totalCost !== undefined && update.data.totalCost < 0) {
          throw new BadRequestException('Total costs cannot be negative');
        }
      }

      return await this.inventoryMovementRepository.updateBatch(updates);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update bulk movements: ' + error.message);
    }
  }

  async deleteBulkMovements(ids: string[]): Promise<void> {
    try {
      await this.inventoryMovementRepository.removeBatch(ids);
    } catch (error) {
      throw new BadRequestException('Failed to delete bulk movements: ' + error.message);
    }
  }

  // Utilidades
  async movementExists(id: string): Promise<boolean> {
    try {
      return await this.inventoryMovementRepository.exists(id);
    } catch (error) {
      throw new BadRequestException('Failed to check movement existence: ' + error.message);
    }
  }

  async countMovements(queryDto?: InventoryMovementQueryDto): Promise<number> {
    try {
      return await this.inventoryMovementRepository.count(queryDto);
    } catch (error) {
      throw new BadRequestException('Failed to count movements: ' + error.message);
    }
  }

  async getLastMovement(productId: string, variantId?: string): Promise<InventoryMovement | null> {
    try {
      return await this.inventoryMovementRepository.getLastMovement(productId, variantId);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve last movement: ' + error.message);
    }
  }

  async calculateStockFromMovements(
    productId: string,
    variantId?: string,
    upToDate?: Date
  ): Promise<number> {
    try {
      return await this.inventoryMovementRepository.calculateStockFromMovements(
        productId,
        variantId,
        upToDate
      );
    } catch (error) {
      throw new BadRequestException('Failed to calculate stock from movements: ' + error.message);
    }
  }

  // Métodos de conveniencia para tipos específicos de movimientos
  async createInboundMovement(
    productId: string,
    quantity: number,
    previousStock: number,
    reason: MovementReason,
    options: {
      variantId?: string;
      location?: string;
      unitCost?: number;
      totalCost?: number;
      referenceType?: string;
      referenceId?: string;
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
    } = {}
  ): Promise<InventoryMovement> {
    const createDto: CreateInventoryMovementDto = {
      productId,
      productVariantId: options.variantId,
      type: MovementType.IN,
      reason,
      quantity,
      previousStock,
      newStock: previousStock + quantity,
      location: options.location,
      unitCost: options.unitCost,
      totalCost: options.totalCost,
      referenceType: options.referenceType,
      referenceId: options.referenceId,
      referenceNumber: options.referenceNumber,
      notes: options.notes,
      performedBy: options.performedBy,
    };

    return this.createMovement(createDto);
  }

  async createOutboundMovement(
    productId: string,
    quantity: number,
    previousStock: number,
    reason: MovementReason,
    options: {
      variantId?: string;
      location?: string;
      unitCost?: number;
      totalCost?: number;
      referenceType?: string;
      referenceId?: string;
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
    } = {}
  ): Promise<InventoryMovement> {
    const createDto: CreateInventoryMovementDto = {
      productId,
      productVariantId: options.variantId,
      type: MovementType.OUT,
      reason,
      quantity,
      previousStock,
      newStock: previousStock - quantity,
      location: options.location,
      unitCost: options.unitCost,
      totalCost: options.totalCost,
      referenceType: options.referenceType,
      referenceId: options.referenceId,
      referenceNumber: options.referenceNumber,
      notes: options.notes,
      performedBy: options.performedBy,
    };

    return this.createMovement(createDto);
  }

  async createStockAdjustment(
    productId: string,
    newQuantity: number,
    currentStock: number,
    options: {
      variantId?: string;
      location?: string;
      reason?: string;
      performedBy?: string;
    } = {}
  ): Promise<InventoryMovement> {
    try {
      const difference = newQuantity - currentStock;
      
      if (difference === 0) {
        throw new BadRequestException('No adjustment needed - current stock matches target quantity');
      }
      
      const movementType = difference > 0 ? MovementType.IN : MovementType.OUT;
      const quantity = Math.abs(difference);
      
      const createDto: CreateInventoryMovementDto = {
        productId,
        productVariantId: options.variantId,
        type: movementType,
        reason: MovementReason.ADJUSTMENT,
        quantity,
        previousStock: currentStock,
        newStock: newQuantity,
        location: options.location,
        notes: options.reason || `Stock adjustment: ${currentStock} → ${newQuantity}`,
        performedBy: options.performedBy,
      };

      return this.createMovement(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create stock adjustment: ' + error.message);
    }
  }
}