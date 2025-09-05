import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return await this.orderRepository.save(order);
  }

  async findAll(queryDto?: QueryOrderDto): Promise<Order[]> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('orderItems.productVariant', 'productVariant');

    if (queryDto?.status) {
      query.andWhere('order.status = :status', { status: queryDto.status });
    }

    if (queryDto?.customerId) {
      query.andWhere('order.customerId = :customerId', { customerId: queryDto.customerId });
    }

    if (queryDto?.startDate && queryDto?.endDate) {
      query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: queryDto.startDate,
        endDate: queryDto.endDate,
      });
    }

    return await query
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'orderItems',
        'orderItems.product',
        'orderItems.productVariant',
        'shippingAddress',
        'billingAddress',
      ],
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['customer', 'orderItems', 'orderItems.product'],
    });
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { customerId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order | null> {
    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    await this.orderRepository.update(id, { status: OrderStatus[status.toUpperCase()] });
    return this.findOne(id);
  }

  async findPendingOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { status: OrderStatus.PENDING },
      relations: ['customer', 'orderItems'],
      order: { createdAt: 'ASC' },
    });
  }
}