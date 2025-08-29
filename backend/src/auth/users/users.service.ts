import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Validar si el email ya existe
    const emailExists = await this.usersRepository.existsByEmail(createUserDto.email);
    if (emailExists) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usersRepository.create(createUserDto);
    return user;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const result = await this.usersRepository.findAll(page, limit);
    return result;
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto | UpdatePasswordDto) {
    const userExists = await this.usersRepository.existsById(id);
    if (!userExists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const user = await this.usersRepository.update(id, updateUserDto);
    return user;
  }

  async delete(id: string) {
    const userExists = await this.usersRepository.existsById(id);
    if (!userExists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.delete(id);
    return { message: 'Usuario eliminado exitosamente' };
  }
}