import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CustomResponse } from '../../core/custom-response';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Validar si el email ya existe
    const emailExists = await this.usersRepository.existsByEmail(createUserDto.email);
    if (emailExists) {
      return CustomResponse.conflict('El email ya está registrado');
    }

    try {
      const user = await this.usersRepository.create(createUserDto);
      return CustomResponse.created('Usuario creado exitosamente', user);
    } catch (error) {
      return CustomResponse.error('Error al crear usuario', error.message);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const result = await this.usersRepository.findAll(page, limit);
      return CustomResponse.success('Usuarios obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error('Error al obtener usuarios', error.message);
    }
  }

  async findById(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      return CustomResponse.notFound('Usuario no encontrado');
    }
    return CustomResponse.success('Usuario encontrado', user);
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return CustomResponse.notFound('Usuario no encontrado');
    }
    return CustomResponse.success('Usuario encontrado', user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.usersRepository.existsById(id);
    if (!userExists) {
      return CustomResponse.notFound('Usuario no encontrado');
    }

    try {
      const user = await this.usersRepository.update(id, updateUserDto);
      return CustomResponse.success('Usuario actualizado exitosamente', user);
    } catch (error) {
      return CustomResponse.error('Error al actualizar usuario', error.message);
    }
  }

  async delete(id: number) {
    const userExists = await this.usersRepository.existsById(id);
    if (!userExists) {
      return CustomResponse.notFound('Usuario no encontrado');
    }

    try {
      await this.usersRepository.delete(id);
      return CustomResponse.success('Usuario eliminado exitosamente');
    } catch (error) {
      return CustomResponse.error('Error al eliminar usuario', error.message);
    }
  }
}