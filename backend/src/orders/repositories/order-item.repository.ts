import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderItemDto, UpdateOrderItemDto } from '../dto';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create(createOrderItemDto);
    return await this.orderItemRepository.save(orderItem);
  }

  async findAll(): Promise<OrderItem[]> {
    return await this.orderItemRepository.find({
      relations: ['order', 'product', 'productVariant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrderItem | null> {
    return await this.orderItemRepository.findOne({
      where: { id },
      relations: ['order', 'product', 'productVariant'],
    });
  }

  async findByOrder(orderId: string): Promise<OrderItem[]> {
    return await this.orderItemRepository.find({
      where: { orderId },
      relations: ['product', 'productVariant'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByProduct(productId: string): Promise<OrderItem[]> {
    return await this.orderItemRepository.find({
      where: { productId },
      relations: ['order', 'order.customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem | null> {
    await this.orderItemRepository.update(id, updateOrderItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderItemRepository.delete(id);
  }

  async updateQuantity(id: string, quantity: number): Promise<OrderItem | null> {
    await this.orderItemRepository.update(id, { quantity });
    return this.findOne(id);
  }

  async bulkCreate(orderItems: CreateOrderItemDto[]): Promise<OrderItem[]> {
    const items = this.orderItemRepository.create(orderItems);
    return await this.orderItemRepository.save(items);
  }
}