import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      relations: ['addresses', 'orders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: ['addresses', 'orders'],
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer | null> {
    await this.customerRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async findActive(): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { status: CustomerStatus.ACTIVE },
      relations: ['addresses'],
      order: { createdAt: 'DESC' },
    });
  }
}