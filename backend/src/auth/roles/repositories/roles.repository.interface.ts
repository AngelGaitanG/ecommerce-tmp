import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role as RoleEnum } from '../enums/role.enum';
import { UpdateRoleDto } from '../dto/update-role.dto';

export interface IRolesRepository {
  // Métodos básicos CRUD
  create(createRoleDto: CreateRoleDto): Promise<Role>;
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  findByName(name: RoleEnum): Promise<Role | null>;
  update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role>;
  delete(id: number): Promise<boolean>;
  
  // Métodos específicos del dominio
  findRolesWithUsers(): Promise<Role[]>;
  countUsersInRole(roleId: number): Promise<number>;
  findDefaultRoles(): Promise<Role[]>;
  
  // Métodos de validación
  existsByName(name: RoleEnum): Promise<boolean>;
  existsById(id: number): Promise<boolean>;
}