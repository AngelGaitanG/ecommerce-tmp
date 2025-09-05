import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Address } from './address.entity';
import { v4 as uuidv4 } from 'uuid';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

@Entity('customers')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true })
@Index(['status', 'isActive'])
@Index(['customerType'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  // Información personal
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  // Información de negocio (para clientes empresariales)
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  customerType: CustomerType;

  // Configuración y estado
  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: true })
  acceptsMarketing: boolean;

  // Preferencias
  @Column({ type: 'varchar', length: 10, default: 'es' })
  preferredLanguage: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  preferredCurrency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;

  // Información adicional
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Estadísticas
  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'timestamp', nullable: true })
  lastOrderDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginDate: Date;

  // Relaciones
  @OneToMany(() => Order, (order) => order.customer, {
    cascade: true,
  })
  orders: Order[];

  @OneToMany(() => Address, (address) => address.customer, {
    cascade: true,
  })
  addresses: Address[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos utilitarios
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  getDisplayName(): string {
    if (this.customerType === CustomerType.BUSINESS && this.companyName) {
      return this.companyName;
    }
    return this.getFullName();
  }

  isVerified(): boolean {
    return this.isEmailVerified && this.isPhoneVerified;
  }

  isBusinessCustomer(): boolean {
    return this.customerType === CustomerType.BUSINESS;
  }

  canPlaceOrder(): boolean {
    return this.status === CustomerStatus.ACTIVE && this.isActive;
  }

  updateOrderStats(orderValue: number): void {
    this.totalOrders += 1;
    this.totalSpent += orderValue;
    this.averageOrderValue = this.totalSpent / this.totalOrders;
    this.lastOrderDate = new Date();
  }

  getDefaultAddress(): Address | null {
    return this.addresses?.find(addr => addr.isDefault) || this.addresses?.[0] || null;
  }

  getShippingAddresses(): Address[] {
    return this.addresses?.filter(addr => addr.type === 'shipping') || [];
  }

  getBillingAddresses(): Address[] {
    return this.addresses?.filter(addr => addr.type === 'billing') || [];
  }

  hasCompletedProfile(): boolean {
    const requiredFields = [this.firstName, this.lastName, this.email];
    return requiredFields.every(field => field && field.trim().length > 0);
  }

  getCustomerSegment(): string {
    if (this.totalSpent >= 1000) return 'VIP';
    if (this.totalSpent >= 500) return 'Premium';
    if (this.totalOrders >= 5) return 'Regular';
    return 'New';
  }

  daysSinceLastOrder(): number {
    if (!this.lastOrderDate) return -1;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastOrderDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isAtRiskOfChurn(): boolean {
    const daysSince = this.daysSinceLastOrder();
    return daysSince > 90 && this.totalOrders > 0;
  }
}