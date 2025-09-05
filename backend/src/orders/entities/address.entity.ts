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
import { Customer } from './customer.entity';

/**
 * Tipos de dirección disponibles
 */
export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both',
}

/**
 * Entidad Address - Maneja direcciones de envío y facturación
 * 
 * Esta entidad almacena las direcciones asociadas a los clientes,
 * permitiendo múltiples direcciones por cliente con diferentes propósitos.
 */
@Entity('addresses')
@Index(['customerId', 'type'])
@Index(['customerId', 'isDefault'])
@Index(['country', 'state', 'city'])
@Index(['postalCode'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === RELACIONES ===
  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer, customer => customer.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  // === INFORMACIÓN BÁSICA ===
  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.SHIPPING,
  })
  type: AddressType;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 150, nullable: true })
  company?: string;

  // === DIRECCIÓN ===
  @Column({ length: 200 })
  addressLine1: string;

  @Column({ length: 200, nullable: true })
  addressLine2?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 2 })
  country: string; // Código ISO de 2 letras (US, MX, CA, etc.)

  @Column({ length: 100, nullable: true })
  neighborhood?: string;

  @Column({ length: 200, nullable: true })
  landmark?: string;

  // === CONTACTO ===
  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 150, nullable: true })
  email?: string;

  // === CONFIGURACIÓN ===
  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  // === INFORMACIÓN ADICIONAL ===
  @Column({ type: 'text', nullable: true })
  deliveryInstructions?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  // === AUDITORÍA ===
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  // === MÉTODOS UTILITARIOS ===

  /**
   * Obtiene el nombre completo del destinatario
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Obtiene la dirección completa formateada
   */
  getFormattedAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Verifica si la dirección está completa
   */
  isComplete(): boolean {
    return !!(this.firstName &&
      this.lastName &&
      this.addressLine1 &&
      this.city &&
      this.state &&
      this.postalCode &&
      this.country);
  }

  /**
   * Verifica si es una dirección de envío
   */
  isShippingAddress(): boolean {
    return this.type === AddressType.SHIPPING || this.type === AddressType.BOTH;
  }

  /**
   * Verifica si es una dirección de facturación
   */
  isBillingAddress(): boolean {
    return this.type === AddressType.BILLING || this.type === AddressType.BOTH;
  }

  /**
   * Marca la dirección como usada recientemente
   */
  markAsUsed(): void {
    this.lastUsedAt = new Date();
  }

  /**
   * Marca la dirección como verificada
   */
  markAsVerified(): void {
    this.isVerified = true;
    this.verifiedAt = new Date();
  }

  /**
   * Obtiene un resumen de la dirección para mostrar en listas
   */
  getSummary(): string {
    const name = this.getFullName();
    const address = `${this.addressLine1}, ${this.city}, ${this.state} ${this.postalCode}`;
    return `${name} - ${address}`;
  }

  /**
   * Verifica si tiene coordenadas geográficas
   */
  hasCoordinates(): boolean {
    return !!(this.latitude && this.longitude);
  }

  /**
   * Establece las coordenadas geográficas
   */
  setCoordinates(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
  }

  /**
   * Obtiene las coordenadas como objeto
   */
  getCoordinates(): { lat: number; lng: number } | null {
    if (!this.hasCoordinates()) {
      return null;
    }
    return {
      lat: this.latitude!,
      lng: this.longitude!,
    };
  }
}