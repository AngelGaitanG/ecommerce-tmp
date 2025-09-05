import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Address } from './entities/address.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CustomerRepository } from './repositories/customer.repository';
import { AddressRepository } from './repositories/address.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { CreateCustomerDto} from './dto/create-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateAddressDto, UpdateCustomerDto, UpdateOrderDto, UpdateOrderItemDto } from './dto';


@Injectable()
export class OrdersService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly addressRepository: AddressRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
  ) {}

  // ==================== CUSTOMER METHODS ====================
  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar si el email ya existe
    const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
    if (existingCustomer) {
      throw new BadRequestException('Customer with this email already exists');
    }
    return await this.customerRepository.create(createCustomerDto);
  }

  async findAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.findAll();
  }

  async findCustomer(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findCustomerByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.update(id, updateCustomerDto);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async removeCustomer(id: string): Promise<void> {
    const customer = await this.customerRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    await this.customerRepository.remove(id);
  }

  async findActiveCustomers(): Promise<Customer[]> {
    return await this.customerRepository.findActive();
  }

  // ==================== ADDRESS METHODS ====================
  async createAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    // Verificar que el customer existe
    await this.findCustomer(createAddressDto.customerId);
    return await this.addressRepository.create(createAddressDto);
  }

  async findAllAddresses(): Promise<Address[]> {
    return await this.addressRepository.findAll();
  }

  async findAddress(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async findAddressesByCustomer(customerId: string): Promise<Address[]> {
    await this.findCustomer(customerId); // Verificar que el customer existe
    return await this.addressRepository.findByCustomer(customerId);
  }

  async findDefaultAddress(customerId: string, type?: 'shipping' | 'billing'): Promise<Address | null> {
    await this.findCustomer(customerId);
    return await this.addressRepository.findDefaultByCustomer(customerId, type);
  }

  async updateAddress(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.update(id, updateAddressDto);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async removeAddress(id: string): Promise<void> {
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    await this.addressRepository.remove(id);
  }

  async setDefaultAddress(id: string, customerId: string): Promise<void> {
    const address = await this.addressRepository.findOne(id);
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    if (address.customerId !== customerId) {
      throw new BadRequestException('Address does not belong to this customer');
    }
    await this.addressRepository.setAsDefault(id, customerId);
  }

  // ==================== ORDER METHODS ====================
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Verificar que el customer existe
    await this.findCustomer(createOrderDto.customerId);
    
    // Verificar direcciones si se proporcionan
    if (createOrderDto.shippingAddressId) {
      await this.findAddress(createOrderDto.shippingAddressId);
    }
    if (createOrderDto.billingAddressId) {
      await this.findAddress(createOrderDto.billingAddressId);
    }

    // Crear la orden
    const order = await this.orderRepository.create(createOrderDto);
    
    // Si hay items, crearlos
    if (createOrderDto.items && createOrderDto.items.length > 0) {
      const orderItemsData = createOrderDto.items.map(item => ({
        ...item,
        orderId: order.id,
      }));
      await this.orderItemRepository.bulkCreate(orderItemsData);
    }

    return await this.orderRepository.findOne(order.id);
  }

  async findAllOrders(queryDto?: QueryOrderDto): Promise<Order[]> {
    return await this.orderRepository.findAll(queryDto);
  }

  async findOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }
    return order;
  }

  async findOrdersByCustomer(customerId: string): Promise<Order[]> {
    await this.findCustomer(customerId);
    return await this.orderRepository.findByCustomer(customerId);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.update(id, updateOrderDto);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderRepository.updateStatus(id, status);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async removeOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    await this.orderRepository.remove(id);
  }

  async findPendingOrders(): Promise<Order[]> {
    return await this.orderRepository.findPendingOrders();
  }

  // ==================== ORDER ITEM METHODS ====================
  async createOrderItem(orderId: string, createOrderItemDto: Omit<CreateOrderItemDto, 'orderId'>): Promise<OrderItem> {
    // Verificar que la orden existe
    await this.findOrder(orderId);
    
    const orderItemData = {
      ...createOrderItemDto,
      orderId,
    };
    
    return await this.orderItemRepository.create(orderItemData);
  }

  async findAllOrderItems(): Promise<OrderItem[]> {
    return await this.orderItemRepository.findAll();
  }

  async findOrderItem(id: string): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne(id);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }
    return orderItem;
  }

  async findOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    await this.findOrder(orderId);
    return await this.orderItemRepository.findByOrder(orderId);
  }

  async findOrderItemsByProduct(productId: string): Promise<OrderItem[]> {
    return await this.orderItemRepository.findByProduct(productId);
  }

  async updateOrderItem(id: string, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.update(id, updateOrderItemDto);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }
    return orderItem;
  }

  async updateOrderItemQuantity(id: string, quantity: number): Promise<OrderItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    const orderItem = await this.orderItemRepository.updateQuantity(id, quantity);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }
    return orderItem;
  }

  async removeOrderItem(id: string): Promise<void> {
    const orderItem = await this.orderItemRepository.findOne(id);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }
    await this.orderItemRepository.remove(id);
  }

  // ==================== UTILITY METHODS ====================
  async getOrderSummary(orderId: string): Promise<any> {
    const order = await this.findOrder(orderId);
    const orderItems = await this.findOrderItemsByOrder(orderId);
    
    return {
      order,
      items: orderItems,
      itemCount: orderItems.length,
      totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      calculatedTotal: orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
    };
  }

  async getCustomerOrderHistory(customerId: string): Promise<any> {
    const customer = await this.findCustomer(customerId);
    const orders = await this.findOrdersByCustomer(customerId);
    
    return {
      customer,
      orders,
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    };
  }
}