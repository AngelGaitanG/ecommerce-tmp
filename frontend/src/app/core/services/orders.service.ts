import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Order,
  OrderItem,
  Customer,
  Address,
  OrderStatistics,
  CreateOrderDto,
  UpdateOrderDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateAddressDto,
  UpdateAddressDto,
  ApiResponse,
  PaginatedResponse,
  QueryParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly ordersUrl = '/orders';
  private readonly customersUrl = '/customers';
  private readonly addressesUrl = '/addresses';
  private readonly statisticsUrl = '/statistics';

  constructor(private apiService: ApiService) {}

  // Order CRUD operations
  getOrders(params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Order>>> {
    return this.apiService.get<PaginatedResponse<Order>>(this.ordersUrl, params);
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.apiService.get<Order>(`${this.ordersUrl}/${id}`);
  }

  createOrder(order: CreateOrderDto): Observable<ApiResponse<Order>> {
    return this.apiService.post<Order>(this.ordersUrl, order);
  }

  updateOrder(id: string, order: UpdateOrderDto): Observable<ApiResponse<Order>> {
    return this.apiService.patch<Order>(`${this.ordersUrl}/${id}`, order);
  }

  deleteOrder(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.ordersUrl}/${id}`);
  }

  // Order items
  getOrderItems(orderId: string): Observable<ApiResponse<OrderItem[]>> {
    return this.apiService.get<OrderItem[]>(`${this.ordersUrl}/${orderId}/items`);
  }

  addOrderItem(orderId: string, item: any): Observable<ApiResponse<OrderItem>> {
    return this.apiService.post<OrderItem>(`${this.ordersUrl}/${orderId}/items`, item);
  }

  updateOrderItem(orderId: string, itemId: string, item: any): Observable<ApiResponse<OrderItem>> {
    return this.apiService.patch<OrderItem>(`${this.ordersUrl}/${orderId}/items/${itemId}`, item);
  }

  removeOrderItem(orderId: string, itemId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.ordersUrl}/${orderId}/items/${itemId}`);
  }

  // Customer CRUD operations
  getCustomers(params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Customer>>> {
    return this.apiService.get<PaginatedResponse<Customer>>(this.customersUrl, params);
  }

  getCustomer(id: string): Observable<ApiResponse<Customer>> {
    return this.apiService.get<Customer>(`${this.customersUrl}/${id}`);
  }

  createCustomer(customer: CreateCustomerDto): Observable<ApiResponse<Customer>> {
    return this.apiService.post<Customer>(this.customersUrl, customer);
  }

  updateCustomer(id: string, customer: UpdateCustomerDto): Observable<ApiResponse<Customer>> {
    return this.apiService.patch<Customer>(`${this.customersUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.customersUrl}/${id}`);
  }

  // Customer orders
  getCustomerOrders(customerId: string, params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Order>>> {
    return this.apiService.get<PaginatedResponse<Order>>(`${this.customersUrl}/${customerId}/orders`, params);
  }

  // Customer addresses
  getCustomerAddresses(customerId: string): Observable<ApiResponse<Address[]>> {
    return this.apiService.get<Address[]>(`${this.customersUrl}/${customerId}/addresses`);
  }

  // Address CRUD operations
  getAddresses(params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Address>>> {
    return this.apiService.get<PaginatedResponse<Address>>(this.addressesUrl, params);
  }

  getAddress(id: string): Observable<ApiResponse<Address>> {
    return this.apiService.get<Address>(`${this.addressesUrl}/${id}`);
  }

  createAddress(address: CreateAddressDto): Observable<ApiResponse<Address>> {
    return this.apiService.post<Address>(this.addressesUrl, address);
  }

  updateAddress(id: string, address: UpdateAddressDto): Observable<ApiResponse<Address>> {
    return this.apiService.patch<Address>(`${this.addressesUrl}/${id}`, address);
  }

  deleteAddress(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`${this.addressesUrl}/${id}`);
  }

  // Statistics
  getOrderStatistics(): Observable<ApiResponse<OrderStatistics>> {
    return this.apiService.get<OrderStatistics>(this.statisticsUrl);
  }

  // Search operations
  searchOrders(query: string, params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Order>>> {
    const searchParams = { ...params, search: query };
    return this.apiService.get<PaginatedResponse<Order>>(`${this.ordersUrl}/search`, searchParams);
  }

  searchCustomers(query: string, params?: QueryParams): Observable<ApiResponse<PaginatedResponse<Customer>>> {
    const searchParams = { ...params, search: query };
    return this.apiService.get<PaginatedResponse<Customer>>(`${this.customersUrl}/search`, searchParams);
  }
}