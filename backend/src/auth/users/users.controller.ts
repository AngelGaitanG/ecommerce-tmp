import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CustomResponse } from '../../core/custom-response';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Para usar los DTOs de respuesta
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return CustomResponse.created('Usuario creado exitosamente', user);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const result = await this.usersService.findAll(page, limit);
      return CustomResponse.success('Usuarios obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      return CustomResponse.success('Usuario encontrado', user);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return CustomResponse.success('Usuario actualizado exitosamente', user);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.delete(id);
      return CustomResponse.success('Usuario eliminado exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }
}