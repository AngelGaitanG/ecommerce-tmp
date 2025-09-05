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
import { Order } from './order.entity';
import { Product } from '../../catalog/products/entities/product.entity';
import { ProductVariant } from '../../catalog/products/entities/product-variant.entity';

/**
 * Estados del item del pedido
 */
export enum OrderItemStatus {
  PENDING = 'pending',           // Pendiente
  CONFIRMED = 'confirmed',       // Confirmado
  PROCESSING = 'processing',     // En procesamiento
  SHIPPED = 'shipped',           // Enviado
  DELIVERED = 'delivered',       // Entregado
  CANCELLED = 'cancelled',       // Cancelado
  REFUNDED = 'refunded',         // Reembolsado
  RETURNED = 'returned',         // Devuelto
  OUT_OF_STOCK = 'out_of_stock', // Sin stock
}

/**
 * Entidad OrderItem - Representa los elementos individuales de un pedido
 * 
 * Esta entidad almacena cada producto o variante incluida en un pedido,
 * con su cantidad, precios y estado individual.
 */
@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
@Index(['productVariantId'])
@Index(['status'])
@Index(['orderId', 'productId'])
@Index(['orderId', 'productVariantId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === RELACIONES ===
  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, order => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid', { nullable: true })
  productVariantId?: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'productVariantId' })
  productVariant?: ProductVariant;

  // === INFORMACIÓN DEL PRODUCTO ===
  @Column({ length: 200 })
  productName: string; // Nombre del producto al momento del pedido

  @Column({ length: 100, nullable: true })
  productSku?: string; // SKU del producto al momento del pedido

  @Column({ length: 200, nullable: true })
  variantName?: string; // Nombre de la variante al momento del pedido

  @Column({ length: 100, nullable: true })
  variantSku?: string; // SKU de la variante al momento del pedido

  @Column({ type: 'json', nullable: true })
  productAttributes?: Record<string, any>; // Atributos del producto (color, talla, etc.)

  @Column({ length: 500, nullable: true })
  productImage?: string; // URL de la imagen principal

  // === CANTIDAD Y PRECIOS ===
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Precio unitario al momento del pedido

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice?: number; // Precio original antes de descuentos

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number; // Descuento aplicado por unidad

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  discountRate: number; // Tasa de descuento aplicada

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // Precio total del item (quantity * unitPrice)

  // === INFORMACIÓN FISCAL ===
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number; // Tasa de impuestos aplicada

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number; // Monto de impuestos

  // === ESTADO Y SEGUIMIENTO ===
  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  @Column({ type: 'int', default: 0 })
  shippedQuantity: number; // Cantidad enviada

  @Column({ type: 'int', default: 0 })
  deliveredQuantity: number; // Cantidad entregada

  @Column({ type: 'int', default: 0 })
  returnedQuantity: number; // Cantidad devuelta

  @Column({ type: 'int', default: 0 })
  refundedQuantity: number; // Cantidad reembolsada

  // === INFORMACIÓN ADICIONAL ===
  @Column({ type: 'text', nullable: true })
  notes?: string; // Notas específicas del item

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // Información adicional

  // === PERSONALIZACIÓN ===
  @Column({ default: false })
  isCustomized: boolean; // Si el producto tiene personalizaciones

  @Column({ type: 'json', nullable: true })
  customizations?: Record<string, any>; // Detalles de personalización

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  customizationCost: number; // Costo adicional por personalización

  // === INFORMACIÓN DE INVENTARIO ===
  @Column({ default: true })
  inventoryReserved: boolean; // Si el inventario está reservado

  @Column({ type: 'timestamp', nullable: true })
  reservedAt?: Date; // Cuándo se reservó el inventario

  @Column({ type: 'timestamp', nullable: true })
  reservationExpiresAt?: Date; // Cuándo expira la reserva

  // === AUDITORÍA ===
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  // === MÉTODOS UTILITARIOS ===

  /**
   * Calcula el precio total del item
   */
  calculateTotalPrice(): number {
    return (this.unitPrice * this.quantity) + this.customizationCost;
  }

  /**
   * Actualiza el precio total
   */
  updateTotalPrice(): void {
    this.totalPrice = this.calculateTotalPrice();
  }

  /**
   * Calcula el monto de impuestos
   */
  calculateTaxAmount(): number {
    return this.totalPrice * this.taxRate;
  }

  /**
   * Actualiza el monto de impuestos
   */
  updateTaxAmount(): void {
    this.taxAmount = this.calculateTaxAmount();
  }

  /**
   * Obtiene el precio final incluyendo impuestos
   */
  getFinalPrice(): number {
    return this.totalPrice + this.taxAmount;
  }

  /**
   * Verifica si el item puede ser cancelado
   */
  canBeCancelled(): boolean {
    return [OrderItemStatus.PENDING, OrderItemStatus.CONFIRMED].includes(this.status);
  }

  /**
   * Verifica si el item puede ser devuelto
   */
  canBeReturned(): boolean {
    return this.status === OrderItemStatus.DELIVERED && this.returnedQuantity < this.deliveredQuantity;
  }

  /**
   * Verifica si el item puede ser reembolsado
   */
  canBeRefunded(): boolean {
    return [OrderItemStatus.DELIVERED, OrderItemStatus.RETURNED].includes(this.status) &&
           this.refundedQuantity < this.quantity;
  }

  /**
   * Verifica si el item está completamente enviado
   */
  isFullyShipped(): boolean {
    return this.shippedQuantity >= this.quantity;
  }

  /**
   * Verifica si el item está completamente entregado
   */
  isFullyDelivered(): boolean {
    return this.deliveredQuantity >= this.quantity;
  }

  /**
   * Verifica si el item está parcialmente enviado
   */
  isPartiallyShipped(): boolean {
    return this.shippedQuantity > 0 && this.shippedQuantity < this.quantity;
  }

  /**
   * Verifica si el item está parcialmente entregado
   */
  isPartiallyDelivered(): boolean {
    return this.deliveredQuantity > 0 && this.deliveredQuantity < this.quantity;
  }

  /**
   * Obtiene la cantidad pendiente de envío
   */
  getPendingShipmentQuantity(): number {
    return Math.max(0, this.quantity - this.shippedQuantity);
  }

  /**
   * Obtiene la cantidad pendiente de entrega
   */
  getPendingDeliveryQuantity(): number {
    return Math.max(0, this.shippedQuantity - this.deliveredQuantity);
  }

  /**
   * Obtiene la cantidad disponible para devolución
   */
  getReturnableQuantity(): number {
    return Math.max(0, this.deliveredQuantity - this.returnedQuantity);
  }

  /**
   * Obtiene la cantidad disponible para reembolso
   */
  getRefundableQuantity(): number {
    return Math.max(0, this.quantity - this.refundedQuantity);
  }

  /**
   * Marca una cantidad como enviada
   */
  markAsShipped(quantity: number): void {
    if (quantity > this.getPendingShipmentQuantity()) {
      throw new Error('La cantidad a enviar excede la cantidad pendiente');
    }
    this.shippedQuantity += quantity;
    if (this.isFullyShipped()) {
      this.status = OrderItemStatus.SHIPPED;
      this.shippedAt = new Date();
    }
  }

  /**
   * Marca una cantidad como entregada
   */
  markAsDelivered(quantity: number): void {
    if (quantity > this.getPendingDeliveryQuantity()) {
      throw new Error('La cantidad a entregar excede la cantidad pendiente');
    }
    this.deliveredQuantity += quantity;
    if (this.isFullyDelivered()) {
      this.status = OrderItemStatus.DELIVERED;
      this.deliveredAt = new Date();
    }
  }

  /**
   * Procesa una devolución
   */
  processReturn(quantity: number): void {
    if (quantity > this.getReturnableQuantity()) {
      throw new Error('La cantidad a devolver excede la cantidad disponible');
    }
    this.returnedQuantity += quantity;
    if (this.returnedQuantity >= this.deliveredQuantity) {
      this.status = OrderItemStatus.RETURNED;
    }
  }

  /**
   * Procesa un reembolso
   */
  processRefund(quantity: number): void {
    if (quantity > this.getRefundableQuantity()) {
      throw new Error('La cantidad a reembolsar excede la cantidad disponible');
    }
    this.refundedQuantity += quantity;
    if (this.refundedQuantity >= this.quantity) {
      this.status = OrderItemStatus.REFUNDED;
    }
  }

  /**
   * Cancela el item
   */
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('Este item no puede ser cancelado');
    }
    this.status = OrderItemStatus.CANCELLED;
    this.cancelledAt = new Date();
  }

  /**
   * Reserva el inventario
   */
  reserveInventory(expirationMinutes: number = 30): void {
    this.inventoryReserved = true;
    this.reservedAt = new Date();
    this.reservationExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  }

  /**
   * Libera la reserva de inventario
   */
  releaseInventoryReservation(): void {
    this.inventoryReserved = false;
    this.reservedAt = null;
    this.reservationExpiresAt = null;
  }

  /**
   * Verifica si la reserva de inventario ha expirado
   */
  isReservationExpired(): boolean {
    if (!this.inventoryReserved || !this.reservationExpiresAt) {
      return false;
    }
    return new Date() > this.reservationExpiresAt;
  }

  /**
   * Obtiene el nombre completo del producto (incluyendo variante)
   */
  getFullProductName(): string {
    if (this.variantName) {
      return `${this.productName} - ${this.variantName}`;
    }
    return this.productName;
  }

  /**
   * Obtiene el SKU efectivo (variante o producto)
   */
  getEffectiveSku(): string {
    return this.variantSku || this.productSku || '';
  }

  /**
   * Verifica si tiene personalizaciones
   */
  hasCustomizations(): boolean {
    return this.isCustomized && !!this.customizations;
  }

  /**
   * Obtiene un resumen del item para mostrar
   */
  getSummary(): string {
    const name = this.getFullProductName();
    const qty = this.quantity;
    const price = this.getFinalPrice();
    return `${name} (x${qty}) - $${price.toFixed(2)}`;
  }
}