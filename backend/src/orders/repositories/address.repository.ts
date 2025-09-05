import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressRepository {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(createAddressDto);
    return await this.addressRepository.save(address);
  }

  async findAll(): Promise<Address[]> {
    return await this.addressRepository.find({
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Address | null> {
    return await this.addressRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
  }

  async findByCustomer(customerId: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByCustomer(customerId: string, type?: 'shipping' | 'billing'): Promise<Address | null> {
    const where: any = { customerId, isDefault: true };
    if (type) {
      where.type = type;
    }
    return await this.addressRepository.findOne({ where });
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address | null> {
    await this.addressRepository.update(id, updateAddressDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.addressRepository.delete(id);
  }

  async setAsDefault(id: string, customerId: string): Promise<void> {
    // Primero quitar default de todas las direcciones del cliente
    await this.addressRepository.update(
      { customerId },
      { isDefault: false }
    );
    // Luego establecer la nueva como default
    await this.addressRepository.update(id, { isDefault: true });
  }
}