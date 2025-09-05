import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CustomResponse, ApiResponse } from '../core/custom-response';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateAddressDto,
  UpdateAddressDto,
  CreateOrderDto,
  UpdateOrderDto,
  QueryOrderDto,
  UpdateOrderItemDto,
} from './dto';
import { Customer } from './entities/customer.entity';
import { Address } from './entities/address.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ===== CUSTOMER ENDPOINTS =====
  @Post('customers')
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.ordersService.createCustomer(createCustomerDto);
      return CustomResponse.created('Cliente creado exitosamente', customer);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers')
  async findAllCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const customers = await this.ordersService.findAllCustomers();
      return CustomResponse.success('Clientes obtenidos exitosamente', customers);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/active')
  async findActiveCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const customers = await this.ordersService.findActiveCustomers();
      return CustomResponse.success('Clientes activos obtenidos exitosamente', customers);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/:id')
  async findCustomer(
    @Param('id') id: string,
  ): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.ordersService.findCustomer(id);
      return CustomResponse.success('Cliente obtenido exitosamente', customer);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/email/:email')
  async findCustomerByEmail(
    @Param('email') email: string,
  ): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.ordersService.findCustomerByEmail(email);
      return CustomResponse.success('Cliente obtenido exitosamente', customer);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch('customers/:id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.ordersService.updateCustomer(id, updateCustomerDto);
      return CustomResponse.success('Cliente actualizado exitosamente', customer);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Delete('customers/:id')
  async removeCustomer(
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    try {
      await this.ordersService.removeCustomer(id);
      return CustomResponse.success('Cliente eliminado exitosamente');
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/:id/orders')
  async getCustomerOrderHistory(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    try {
      const history = await this.ordersService.getCustomerOrderHistory(id);
      return CustomResponse.success('Historial de órdenes obtenido exitosamente', history);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  // ===== ADDRESS ENDPOINTS =====
  @Post('addresses')
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<ApiResponse<Address>> {
    try {
      const address = await this.ordersService.createAddress(createAddressDto);
      return CustomResponse.created('Dirección creada exitosamente', address);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('addresses')
  async findAllAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      const addresses = await this.ordersService.findAllAddresses();
      return CustomResponse.success('Direcciones obtenidas exitosamente', addresses);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('addresses/:id')
  async findAddress(
    @Param('id') id: string,
  ): Promise<ApiResponse<Address>> {
    try {
      const address = await this.ordersService.findAddress(id);
      return CustomResponse.success('Dirección obtenida exitosamente', address);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/:customerId/addresses')
  async findCustomerAddresses(
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse<Address[]>> {
    try {
      const addresses = await this.ordersService.findAddressesByCustomer(customerId);
      return CustomResponse.success('Direcciones del cliente obtenidas exitosamente', addresses);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customers/:customerId/addresses/default')
  async findDefaultAddress(
    @Param('customerId') customerId: string,
    @Query('type') type?: 'shipping' | 'billing',
  ): Promise<ApiResponse<Address | null>> {
    try {
      const address = await this.ordersService.findDefaultAddress(customerId, type);
      return CustomResponse.success('Dirección predeterminada obtenida exitosamente', address);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch('addresses/:id')
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<ApiResponse<Address>> {
    try {
      const address = await this.ordersService.updateAddress(id, updateAddressDto);
      return CustomResponse.success('Dirección actualizada exitosamente', address);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Delete('addresses/:id')
  async removeAddress(
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    try {
      await this.ordersService.removeAddress(id);
      return CustomResponse.success('Dirección eliminada exitosamente');
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch('addresses/:id/set-default/:customerId')
  async setDefaultAddress(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse<void>> {
    try {
      await this.ordersService.setDefaultAddress(id, customerId);
      return CustomResponse.success('Dirección establecida como predeterminada');
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  // ===== ORDER ENDPOINTS =====
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersService.createOrder(createOrderDto);
      return CustomResponse.created('Orden creada exitosamente', order);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get()
  async findAllOrders(
    @Query() queryOrderDto: QueryOrderDto,
  ): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.ordersService.findAllOrders(queryOrderDto);
      return CustomResponse.success('Órdenes obtenidas exitosamente', orders);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('pending')
  async findPendingOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.ordersService.findPendingOrders();
      return CustomResponse.success('Órdenes pendientes obtenidas exitosamente', orders);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get(':id')
  async findOrder(
    @Param('id') id: string,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersService.findOrder(id);
      return CustomResponse.success('Orden obtenida exitosamente', order);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('number/:orderNumber')
  async findOrderByNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersService.findOrderByNumber(orderNumber);
      return CustomResponse.success('Orden obtenida exitosamente', order);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('customer/:customerId')
  async findOrdersByCustomer(
    @Param('customerId') customerId: string,
  ): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.ordersService.findOrdersByCustomer(customerId);
      return CustomResponse.success('Órdenes del cliente obtenidas exitosamente', orders);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersService.updateOrder(id, updateOrderDto);
      return CustomResponse.success('Orden actualizada exitosamente', order);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersService.updateOrderStatus(id, status);
      return CustomResponse.success('Estado de la orden actualizado exitosamente', order);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Delete(':id')
  async removeOrder(
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    try {
      await this.ordersService.removeOrder(id);
      return CustomResponse.success('Orden eliminada exitosamente');
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get(':id/summary')
  async getOrderSummary(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    try {
      const summary = await this.ordersService.getOrderSummary(id);
      return CustomResponse.success('Resumen de la orden obtenido exitosamente', summary);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  // ===== ORDER ITEM ENDPOINTS =====
  @Post(':orderId/items')
  async createOrderItem(
    @Param('orderId') orderId: string,
    @Body() createOrderItemDto: any,
  ): Promise<ApiResponse<OrderItem>> {
    try {
      const orderItem = await this.ordersService.createOrderItem(orderId, createOrderItemDto);
      return CustomResponse.created('Item de orden creado exitosamente', orderItem);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('items')
  async findAllOrderItems(): Promise<ApiResponse<OrderItem[]>> {
    try {
      const items = await this.ordersService.findAllOrderItems();
      return CustomResponse.success('Items de órdenes obtenidos exitosamente', items);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('items/:id')
  async findOrderItem(
    @Param('id') id: string,
  ): Promise<ApiResponse<OrderItem>> {
    try {
      const item = await this.ordersService.findOrderItem(id);
      return CustomResponse.success('Item de orden obtenido exitosamente', item);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get(':orderId/items')
  async findOrderItems(
    @Param('orderId') orderId: string,
  ): Promise<ApiResponse<OrderItem[]>> {
    try {
      const items = await this.ordersService.findOrderItemsByOrder(orderId);
      return CustomResponse.success('Items de la orden obtenidos exitosamente', items);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Get('items/product/:productId')
  async findOrderItemsByProduct(
    @Param('productId') productId: string,
  ): Promise<ApiResponse<OrderItem[]>> {
    try {
      const items = await this.ordersService.findOrderItemsByProduct(productId);
      return CustomResponse.success('Items del producto obtenidos exitosamente', items);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch('items/:id')
  async updateOrderItem(
    @Param('id') id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ApiResponse<OrderItem>> {
    try {
      const item = await this.ordersService.updateOrderItem(id, updateOrderItemDto);
      return CustomResponse.success('Item de orden actualizado exitosamente', item);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Patch('items/:id/quantity')
  async updateOrderItemQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ApiResponse<OrderItem>> {
    try {
      const item = await this.ordersService.updateOrderItemQuantity(id, quantity);
      return CustomResponse.success('Cantidad del item actualizada exitosamente', item);
    } catch (error) {
      CustomResponse.error(error);
    }
  }

  @Delete('items/:id')
  async removeOrderItem(
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    try {
      await this.ordersService.removeOrderItem(id);
      return CustomResponse.success('Item de orden eliminado exitosamente');
    } catch (error) {
      CustomResponse.error(error);
    }
  }
}