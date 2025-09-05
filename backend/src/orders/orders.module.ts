import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Customer } from './entities/customer.entity';
import { Address } from './entities/address.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CustomerRepository } from './repositories/customer.repository';
import { AddressRepository } from './repositories/address.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Address,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    CustomerRepository,
    AddressRepository,
    OrderRepository,
    OrderItemRepository,
  ],
  exports: [
    OrdersService,
    CustomerRepository,
    AddressRepository,
    OrderRepository,
    OrderItemRepository,
  ],
})
export class OrdersModule {}