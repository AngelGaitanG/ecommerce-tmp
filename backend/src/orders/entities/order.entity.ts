import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';

/**
 * Estados del pedido
 */
export enum OrderStatus {
  PENDING = 'pending',           // Pendiente de pago
  CONFIRMED = 'confirmed',       // Confirmado y pagado
  PROCESSING = 'processing',     // En procesamiento
  SHIPPED = 'shipped',           // Enviado
  DELIVERED = 'delivered',       // Entregado
  CANCELLED = 'cancelled',       // Cancelado
  REFUNDED = 'refunded',         // Reembolsado
  RETURNED = 'returned',         // Devuelto
}

/**
 * Estados de pago
 */
export enum PaymentStatus {
  PENDING = 'pending',           // Pendiente
  AUTHORIZED = 'authorized',     // Autorizado
  PAID = 'paid',                 // Pagado
  FAILED = 'failed',             // Fallido
  CANCELLED = 'cancelled',       // Cancelado
  REFUNDED = 'refunded',         // Reembolsado
  PARTIALLY_REFUNDED = 'partially_refunded', // Parcialmente reembolsado
}

/**
 * Estados de envío
 */
export enum ShippingStatus {
  PENDING = 'pending',           // Pendiente
  PREPARING = 'preparing',       // Preparando
  SHIPPED = 'shipped',           // Enviado
  IN_TRANSIT = 'in_transit',     // En tránsito
  OUT_FOR_DELIVERY = 'out_for_delivery', // En reparto
  DELIVERED = 'delivered',       // Entregado
  FAILED_DELIVERY = 'failed_delivery',   // Fallo en entrega
  RETURNED = 'returned',         // Devuelto
}

/**
 * Métodos de pago
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  STORE_CREDIT = 'store_credit',
  GIFT_CARD = 'gift_card',
}

/**
 * Entidad Order - Maneja los pedidos del sistema
 * 
 * Esta entidad representa un pedido completo con toda la información
 * necesaria para el procesamiento, pago y envío.
 */
@Entity('orders')
@Index(['customerId'])
@Index(['status'])
@Index(['paymentStatus'])
@Index(['shippingStatus'])
@Index(['orderNumber'])
@Index(['createdAt'])
@Index(['shippingAddressId'])
@Index(['billingAddressId'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === IDENTIFICACIÓN ===
  @Column({ unique: true, length: 50 })
  orderNumber: string; // Número de orden único (ej: ORD-2024-001234)

  // === RELACIONES ===
  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer, customer => customer.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];

  // === DIRECCIONES ===
  @Column('uuid')
  shippingAddressId: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress: Address;

  @Column('uuid')
  billingAddressId: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'billingAddressId' })
  billingAddress: Address;

  // === ESTADOS ===
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  shippingStatus: ShippingStatus;

  // === INFORMACIÓN FINANCIERA ===
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // Subtotal sin impuestos ni envío

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number; // Monto de impuestos

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number; // Tasa de impuestos (ej: 0.16 para 16%)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number; // Costo de envío

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number; // Monto de descuento

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // Total final

  @Column({ length: 3, default: 'USD' })
  currency: string; // Código de moneda ISO

  // === INFORMACIÓN DE PAGO ===
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod;

  @Column({ length: 100, nullable: true })
  paymentTransactionId?: string; // ID de transacción del procesador de pagos

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  // === INFORMACIÓN DE ENVÍO ===
  @Column({ length: 100, nullable: true })
  shippingMethod?: string; // Método de envío (Standard, Express, etc.)

  @Column({ length: 100, nullable: true })
  shippingCarrier?: string; // Transportista (FedEx, UPS, etc.)

  @Column({ length: 100, nullable: true })
  trackingNumber?: string; // Número de seguimiento

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate?: Date;

  // === CUPONES Y DESCUENTOS ===
  @Column({ length: 50, nullable: true })
  couponCode?: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  discountRate: number; // Tasa de descuento aplicada

  // === INFORMACIÓN ADICIONAL ===
  @Column({ type: 'text', nullable: true })
  notes?: string; // Notas del cliente

  @Column({ type: 'text', nullable: true })
  adminNotes?: string; // Notas internas

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // Información adicional

  // === CONFIGURACIÓN ===
  @Column({ default: false })
  isGift: boolean;

  @Column({ type: 'text', nullable: true })
  giftMessage?: string;

  @Column({ default: false })
  requiresSignature: boolean;

  @Column({ default: false })
  isUrgent: boolean;

  // === AUDITORÍA ===
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ length: 200, nullable: true })
  cancellationReason?: string;

  // === MÉTODOS UTILITARIOS ===

  /**
   * Verifica si el pedido puede ser cancelado
   */
  canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  /**
   * Verifica si el pedido puede ser reembolsado
   */
  canBeRefunded(): boolean {
    return this.paymentStatus === PaymentStatus.PAID &&
           [OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(this.status);
  }

  /**
   * Verifica si el pedido está completado
   */
  isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  /**
   * Verifica si el pedido está cancelado
   */
  isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  /**
   * Verifica si el pedido está pagado
   */
  isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  /**
   * Verifica si el pedido está enviado
   */
  isShipped(): boolean {
    return [ShippingStatus.SHIPPED, ShippingStatus.IN_TRANSIT, 
            ShippingStatus.OUT_FOR_DELIVERY, ShippingStatus.DELIVERED].includes(this.shippingStatus);
  }

  /**
   * Calcula el total del pedido
   */
  calculateTotal(): number {
    return this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;
  }

  /**
   * Actualiza el total del pedido
   */
  updateTotal(): void {
    this.total = this.calculateTotal();
  }

  /**
   * Marca el pedido como pagado
   */
  markAsPaid(transactionId?: string): void {
    this.paymentStatus = PaymentStatus.PAID;
    this.paidAt = new Date();
    if (transactionId) {
      this.paymentTransactionId = transactionId;
    }
    if (this.status === OrderStatus.PENDING) {
      this.status = OrderStatus.CONFIRMED;
    }
  }

  /**
   * Marca el pedido como enviado
   */
  markAsShipped(trackingNumber?: string, carrier?: string): void {
    this.status = OrderStatus.SHIPPED;
    this.shippingStatus = ShippingStatus.SHIPPED;
    this.shippedAt = new Date();
    if (trackingNumber) {
      this.trackingNumber = trackingNumber;
    }
    if (carrier) {
      this.shippingCarrier = carrier;
    }
  }

  /**
   * Marca el pedido como entregado
   */
  markAsDelivered(): void {
    this.status = OrderStatus.DELIVERED;
    this.shippingStatus = ShippingStatus.DELIVERED;
    this.deliveredAt = new Date();
  }

  /**
   * Cancela el pedido
   */
  cancel(reason?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error('Este pedido no puede ser cancelado');
    }
    this.status = OrderStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.cancellationReason = reason;
    }
  }

  /**
   * Aplica un reembolso
   */
  applyRefund(amount: number): void {
    if (amount > this.total - this.refundedAmount) {
      throw new Error('El monto del reembolso excede el total disponible');
    }
    this.refundedAmount += amount;
    if (this.refundedAmount >= this.total) {
      this.paymentStatus = PaymentStatus.REFUNDED;
      this.status = OrderStatus.REFUNDED;
    } else {
      this.paymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
    }
  }

  /**
   * Obtiene el monto disponible para reembolso
   */
  getRefundableAmount(): number {
    return this.total - this.refundedAmount;
  }

  /**
   * Verifica si tiene reembolsos
   */
  hasRefunds(): boolean {
    return this.refundedAmount > 0;
  }

  /**
   * Obtiene el estado general del pedido para mostrar al cliente
   */
  getDisplayStatus(): string {
    switch (this.status) {
      case OrderStatus.PENDING:
        return 'Pendiente de pago';
      case OrderStatus.CONFIRMED:
        return 'Confirmado';
      case OrderStatus.PROCESSING:
        return 'En procesamiento';
      case OrderStatus.SHIPPED:
        return 'Enviado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      case OrderStatus.CANCELLED:
        return 'Cancelado';
      case OrderStatus.REFUNDED:
        return 'Reembolsado';
      case OrderStatus.RETURNED:
        return 'Devuelto';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Genera un número de orden único
   */
  static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}-${timestamp}${random}`;
  }
}