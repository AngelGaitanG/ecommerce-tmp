import { InventoryMovement, MovementType, MovementReason } from '../entities/inventory-movement.entity';
import { CreateInventoryMovementDto, UpdateInventoryMovementDto, InventoryMovementQueryDto } from '../dto';

export interface MovementStats {
  totalMovements: number;
  totalInbound: number;
  totalOutbound: number;
  totalAdjustments: number;
  averageQuantity: number;
  totalValue: number;
}

export interface StockAnalysis {
  productId: string;
  variantId?: string;
  currentStock: number;
  totalInbound: number;
  totalOutbound: number;
  netMovement: number;
  lastMovementDate: Date;
}

export interface MovementsByPeriod {
  period: string;
  movements: number;
  quantity: number;
  value: number;
}

export interface PaginatedMovements {
  data: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IInventoryMovementRepository {
  // Operaciones CRUD básicas
  create(createDto: CreateInventoryMovementDto): Promise<InventoryMovement>;
  findAll(query?: InventoryMovementQueryDto): Promise<PaginatedMovements>;
  findOne(id: string): Promise<InventoryMovement | null>;
  update(id: string, updateDto: UpdateInventoryMovementDto): Promise<InventoryMovement>;
  remove(id: string): Promise<void>;

  // Búsquedas específicas
  findByProduct(productId: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByVariant(variantId: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByType(type: MovementType, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByReason(reason: MovementReason, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByLocation(location: string, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByDateRange(startDate: Date, endDate: Date, query?: InventoryMovementQueryDto): Promise<InventoryMovement[]>;
  findByExternalReference(reference: string, source?: string): Promise<InventoryMovement[]>;
  findPendingMovements(): Promise<InventoryMovement[]>;
  findRecentMovements(limit?: number): Promise<InventoryMovement[]>;

  // Análisis y reportes
  getMovementStats(query?: InventoryMovementQueryDto): Promise<MovementStats>;
  getStockAnalysis(productId: string, variantId?: string): Promise<StockAnalysis>;
  getMovementsByPeriod(period: 'day' | 'week' | 'month' | 'year', startDate?: Date, endDate?: Date): Promise<MovementsByPeriod[]>;
  getTopMovedProducts(limit?: number, period?: { start: Date; end: Date }): Promise<Array<{ productId: string; variantId?: string; totalQuantity: number; movementCount: number }>>;
  getLowStockProducts(threshold?: number): Promise<Array<{ productId: string; variantId?: string; currentStock: number; threshold: number }>>;
  getStockValueReport(): Promise<Array<{ productId: string; variantId?: string; quantity: number; unitCost: number; totalValue: number }>>;

  // Análisis de stock
  getCurrentStock(productId: string, variantId?: string, location?: string): Promise<number>;
  getStockHistory(productId: string, variantId?: string, days?: number): Promise<Array<{ date: Date; stock: number }>>;
  getStockProjection(productId: string, variantId?: string, days?: number): Promise<Array<{ date: Date; projectedStock: number }>>;
  validateStockAvailability(productId: string, variantId: string | undefined, quantity: number, location?: string): Promise<boolean>;

  // Operaciones en lote
  createBatch(movements: CreateInventoryMovementDto[]): Promise<InventoryMovement[]>;
  updateBatch(updates: Array<{ id: string; data: UpdateInventoryMovementDto }>): Promise<InventoryMovement[]>;
  removeBatch(ids: string[]): Promise<void>;

  // Utilidades
  exists(id: string): Promise<boolean>;
  count(query?: InventoryMovementQueryDto): Promise<number>;
  getLastMovement(productId: string, variantId?: string): Promise<InventoryMovement | null>;
  calculateStockFromMovements(productId: string, variantId?: string, upToDate?: Date): Promise<number>;
}