import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from '../../catalog/products/entities/product.entity';
import { ProductVariant } from '../../catalog/products/entities/product-variant.entity';

// Enum para tipos de alerta de stock
export enum AlertType {
  LOW_STOCK = 'low_stock',           // Stock bajo
  OUT_OF_STOCK = 'out_of_stock',     // Sin stock
  OVERSTOCK = 'overstock',           // Exceso de stock
  EXPIRING_SOON = 'expiring_soon',   // Próximo a vencer
  EXPIRED = 'expired',               // Vencido
  REORDER_POINT = 'reorder_point',   // Punto de reorden
}

// Enum para prioridad de la alerta
export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Enum para estado de la alerta
export enum AlertStatus {
  ACTIVE = 'active',       // Alerta activa
  ACKNOWLEDGED = 'acknowledged', // Alerta reconocida
  RESOLVED = 'resolved',   // Alerta resuelta
  DISMISSED = 'dismissed', // Alerta descartada
}

@Entity('stock_alerts')
@Index(['productId', 'status', 'createdAt'])
@Index(['type', 'priority', 'status'])
@Index(['status', 'createdAt'])
@Index(['priority', 'createdAt'])
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con producto
  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Relación con variante de producto (opcional)
  @Column('uuid', { nullable: true })
  productVariantId?: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productVariantId' })
  productVariant?: ProductVariant;

  // Tipo y prioridad de la alerta
  @Column({
    type: 'enum',
    enum: AlertType,
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertPriority,
    default: AlertPriority.MEDIUM,
  })
  priority: AlertPriority;

  // Estado de la alerta
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  // Información del stock
  @Column('decimal', { precision: 10, scale: 2 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  thresholdValue?: number; // Valor umbral que disparó la alerta

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  recommendedAction?: number; // Cantidad recomendada para resolver

  // Ubicación del inventario
  @Column({ length: 100, nullable: true })
  location?: string;

  // Mensaje y descripción
  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  actionRequired?: string; // Acción requerida para resolver

  // Fechas importantes
  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date; // Para alertas de vencimiento

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt?: Date;

  // Usuario que gestionó la alerta
  @Column({ length: 100, nullable: true })
  acknowledgedBy?: string;

  @Column({ length: 100, nullable: true })
  resolvedBy?: string;

  @Column({ length: 100, nullable: true })
  dismissedBy?: string;

  // Configuración de notificaciones
  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  smsSent: boolean;

  @Column({ default: false })
  pushNotificationSent: boolean;

  // Información adicional
  @Column('json', { nullable: true })
  metadata?: Record<string, any>; // Datos adicionales específicos del tipo de alerta

  @Column('text', { nullable: true })
  notes?: string;

  // Campos de auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de utilidad
  isActive(): boolean {
    return this.status === AlertStatus.ACTIVE;
  }

  isResolved(): boolean {
    return this.status === AlertStatus.RESOLVED;
  }

  isCritical(): boolean {
    return this.priority === AlertPriority.CRITICAL;
  }

  isHighPriority(): boolean {
    return this.priority === AlertPriority.HIGH || this.priority === AlertPriority.CRITICAL;
  }

  acknowledge(userId: string): void {
    this.status = AlertStatus.ACKNOWLEDGED;
    this.acknowledgedAt = new Date();
    this.acknowledgedBy = userId;
  }

  resolve(userId: string, notes?: string): void {
    this.status = AlertStatus.RESOLVED;
    this.resolvedAt = new Date();
    this.resolvedBy = userId;
    if (notes) {
      this.notes = notes;
    }
  }

  dismiss(userId: string, reason?: string): void {
    this.status = AlertStatus.DISMISSED;
    this.dismissedAt = new Date();
    this.dismissedBy = userId;
    if (reason) {
      this.notes = reason;
    }
  }

  getDaysActive(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  shouldEscalate(): boolean {
    const daysActive = this.getDaysActive();
    
    switch (this.priority) {
      case AlertPriority.CRITICAL:
        return daysActive > 1; // Escalar después de 1 día
      case AlertPriority.HIGH:
        return daysActive > 3; // Escalar después de 3 días
      case AlertPriority.MEDIUM:
        return daysActive > 7; // Escalar después de 1 semana
      case AlertPriority.LOW:
        return daysActive > 14; // Escalar después de 2 semanas
      default:
        return false;
    }
  }

  getStockDeficit(): number {
    if (this.thresholdValue && this.currentStock < this.thresholdValue) {
      return this.thresholdValue - this.currentStock;
    }
    return 0;
  }
}