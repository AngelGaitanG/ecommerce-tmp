import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUsersRepository {
  // Métodos básicos CRUD
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(page?: number, limit?: number): Promise<{ users: User[]; total: number }>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<boolean>;
  
  // Métodos específicos del dominio
  findByRole(roleName: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findInactiveUsers(): Promise<User[]>;
  activateUser(id: number): Promise<User>;
  deactivateUser(id: number): Promise<User>;
  
  // Métodos de búsqueda avanzada
  searchByName(name: string): Promise<User[]>;
  findUsersWithRoles(): Promise<User[]>;
  countUsersByRole(): Promise<{ role: string; count: number }[]>;
  
  // Métodos de validación
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: number): Promise<boolean>;
}