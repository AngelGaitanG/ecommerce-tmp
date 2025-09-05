import { StockAlert, AlertType, AlertPriority, AlertStatus } from '../entities/stock-alert.entity';
import { CreateStockAlertDto, UpdateStockAlertDto, StockAlertQueryDto, AcknowledgeAlertDto, ResolveAlertDto, DismissAlertDto } from '../dto';

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  dismissedAlerts: number;
  criticalAlerts: number;
  highPriorityAlerts: number;
}

export interface AlertsByType {
  type: AlertType;
  count: number;
  activeCount: number;
}

export interface AlertsByPriority {
  priority: AlertPriority;
  count: number;
  activeCount: number;
}

export interface PaginatedAlerts {
  data: StockAlert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStockAlertRepository {
  // Operaciones CRUD básicas
  create(createDto: CreateStockAlertDto): Promise<StockAlert>;
  findAll(query?: StockAlertQueryDto): Promise<PaginatedAlerts>;
  findOne(id: string): Promise<StockAlert | null>;
  update(id: string, updateDto: UpdateStockAlertDto): Promise<StockAlert>;
  remove(id: string): Promise<void>;

  // Búsquedas específicas
  findByProduct(productId: string, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByVariant(variantId: string, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByType(type: AlertType, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByPriority(priority: AlertPriority, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByStatus(status: AlertStatus, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByLocation(location: string, query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findActive(query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findPending(query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findCritical(query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findExpired(query?: StockAlertQueryDto): Promise<StockAlert[]>;
  findByDateRange(startDate: Date, endDate: Date, query?: StockAlertQueryDto): Promise<StockAlert[]>;

  // Gestión del ciclo de vida de alertas
  acknowledge(id: string, dto: AcknowledgeAlertDto): Promise<StockAlert>;
  resolve(id: string, dto: ResolveAlertDto): Promise<StockAlert>;
  dismiss(id: string, dto: DismissAlertDto): Promise<StockAlert>;
  reactivate(id: string, reason?: string): Promise<StockAlert>;
  snooze(id: string, until: Date, reason?: string): Promise<StockAlert>;
  escalate(id: string, newPriority: AlertPriority, reason?: string): Promise<StockAlert>;

  // Análisis y reportes
  getAlertStats(query?: StockAlertQueryDto): Promise<AlertStats>;
  getAlertsByType(): Promise<AlertsByType[]>;
  getAlertsByPriority(): Promise<AlertsByPriority[]>;
  getAlertTrends(days?: number): Promise<Array<{ date: Date; created: number; resolved: number; active: number }>>;
  getResponseTimeStats(): Promise<{ averageAcknowledgeTime: number; averageResolveTime: number; medianResolveTime: number }>;
  getTopAlertedProducts(limit?: number): Promise<Array<{ productId: string; variantId?: string; alertCount: number; lastAlertDate: Date }>>;

  // Notificaciones
  findPendingNotifications(): Promise<StockAlert[]>;
  markNotificationSent(id: string, channel: string): Promise<void>;
  markNotificationFailed(id: string, channel: string, error: string): Promise<void>;
  resetNotificationStatus(id: string): Promise<void>;

  // Operaciones en lote
  createBatch(alerts: CreateStockAlertDto[]): Promise<StockAlert[]>;
  updateBatch(updates: Array<{ id: string; data: UpdateStockAlertDto }>): Promise<StockAlert[]>;
  removeBatch(ids: string[]): Promise<void>;
  acknowledgeBatch(ids: string[], dto: AcknowledgeAlertDto): Promise<StockAlert[]>;
  resolveBatch(ids: string[], dto: ResolveAlertDto): Promise<StockAlert[]>;
  dismissBatch(ids: string[], dto: DismissAlertDto): Promise<StockAlert[]>;

  // Utilidades
  exists(id: string): Promise<boolean>;
  count(query?: StockAlertQueryDto): Promise<number>;
  findDuplicates(productId: string, variantId?: string, type?: AlertType): Promise<StockAlert[]>;
  cleanupExpiredAlerts(olderThanDays?: number): Promise<number>;
  autoResolveAlerts(productId: string, variantId?: string): Promise<StockAlert[]>;
}