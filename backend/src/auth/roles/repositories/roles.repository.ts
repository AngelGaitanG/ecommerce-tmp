import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { IRolesRepository } from './roles.repository.interface';
import { Role as RoleEnum } from '../enums/role.enum';

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['users'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async findByName(name: RoleEnum): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['users'],
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.roleRepository.update(id, updateRoleDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected > 0;
  }

  async findRolesWithUsers(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['users'],
    });
  }

  async countUsersInRole(roleId: number): Promise<number> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });
    return role?.users?.length || 0;
  }

  async findDefaultRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: [
        { name: RoleEnum.USER },
        { name: RoleEnum.CUSTOMER },
      ],
    });
  }

  async existsByName(name: RoleEnum): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { name } });
    return count > 0;
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { id } });
    return count > 0;
  }
}