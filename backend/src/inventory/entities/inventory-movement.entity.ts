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

// Enum para tipos de movimiento de inventario
export enum MovementType {
  IN = 'in',           // Entrada de inventario
  OUT = 'out',         // Salida de inventario
  ADJUSTMENT = 'adjustment', // Ajuste de inventario
  TRANSFER = 'transfer',     // Transferencia entre ubicaciones
}

// Enum para razones de movimiento
export enum MovementReason {
  PURCHASE = 'purchase',           // Compra
  SALE = 'sale',                   // Venta
  RETURN = 'return',               // Devolución
  DAMAGE = 'damage',               // Daño
  LOSS = 'loss',                   // Pérdida
  FOUND = 'found',                 // Encontrado
  ADJUSTMENT = 'adjustment',       // Ajuste manual
  TRANSFER_IN = 'transfer_in',     // Transferencia entrante
  TRANSFER_OUT = 'transfer_out',   // Transferencia saliente
  INITIAL_STOCK = 'initial_stock', // Stock inicial
  EXPIRED = 'expired',             // Vencido
  PROMOTION = 'promotion',         // Promoción
  SAMPLE = 'sample',               // Muestra
}

@Entity('inventory_movements')
@Index(['productId', 'createdAt'])
@Index(['type', 'createdAt'])
@Index(['reason', 'createdAt'])
@Index(['location', 'createdAt'])
export class InventoryMovement {
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

  // Tipo y razón del movimiento
  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({
    type: 'enum',
    enum: MovementReason,
  })
  reason: MovementReason;

  // Cantidad del movimiento (positiva para entradas, negativa para salidas)
  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  // Stock antes y después del movimiento
  @Column('decimal', { precision: 10, scale: 2 })
  previousStock: number;

  @Column('decimal', { precision: 10, scale: 2 })
  newStock: number;

  // Costos asociados
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  // Ubicación del inventario
  @Column({ length: 100, nullable: true })
  location?: string;

  // Referencias externas
  @Column({ length: 100, nullable: true })
  referenceType?: string; // 'order', 'purchase', 'adjustment', etc.

  @Column('uuid', { nullable: true })
  referenceId?: string;

  @Column({ length: 100, nullable: true })
  referenceNumber?: string;

  // Información adicional
  @Column('text', { nullable: true })
  notes?: string;

  @Column({ length: 100, nullable: true })
  performedBy?: string; // Usuario que realizó el movimiento

  // Campos de auditoría
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de utilidad
  isInbound(): boolean {
    return this.type === MovementType.IN || 
           (this.type === MovementType.ADJUSTMENT && this.quantity > 0) ||
           this.type === MovementType.TRANSFER && this.reason === MovementReason.TRANSFER_IN;
  }

  isOutbound(): boolean {
    return this.type === MovementType.OUT || 
           (this.type === MovementType.ADJUSTMENT && this.quantity < 0) ||
           this.type === MovementType.TRANSFER && this.reason === MovementReason.TRANSFER_OUT;
  }

  getAbsoluteQuantity(): number {
    return Math.abs(this.quantity);
  }

  calculateStockChange(): number {
    return this.newStock - this.previousStock;
  }
}