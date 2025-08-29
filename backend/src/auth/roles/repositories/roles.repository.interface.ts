import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { Role as RoleEnum } from '../enums/role.enum';
import { UpdateRoleDto } from '../dto/update-role.dto';

export interface IRolesRepository {
  // Métodos básicos CRUD
  create(createRoleDto: CreateRoleDto): Promise<Role>;
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: RoleEnum): Promise<Role | null>;
  update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
  delete(id: string): Promise<boolean>;
  
  // Métodos específicos del dominio
  findRolesWithUsers(): Promise<Role[]>;
  countUsersInRole(roleId: string): Promise<number>;
  findDefaultRoles(): Promise<Role[]>;
  
  // Métodos de validación
  existsByName(name: RoleEnum): Promise<boolean>;
  existsById(id: string): Promise<boolean>;

  // Métodos de semillas
  seedDefaultRoles(): Promise<void>;
}