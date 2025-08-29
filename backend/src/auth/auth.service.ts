import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from './users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './users/dto/user-response.dto';
import { UpdatePasswordDto } from './users/dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Verificar si el email ya existe
      await this.usersService.findByEmail(registerDto.email);
      // Si llegamos aquí, el usuario ya existe
      throw new ConflictException('Usuario ya registrado');
    } catch (error) {
      // Si es NotFoundException, el usuario no existe (lo que queremos)
      if (error instanceof NotFoundException) {
        // Continuar con el registro
      } else {
        // Re-lanzar cualquier otra excepción
        throw error;
      }
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Crear usuario con contraseña hasheada
    const createUserDto = {
      ...registerDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(createUserDto);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Preparar respuesta
    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    const authResponse: AuthResponseDto = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hora en segundos
      user: userDto,
    };

    return authResponse;
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    // Preparar respuesta
    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    const authResponse: AuthResponseDto = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hora en segundos
      user: userDto,
    };
    return authResponse;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid && user.isActive) {
        return user;
      }
    } catch (error) {
      // Si no se encuentra el usuario, retornar null
      if (error instanceof NotFoundException) {
        return null;
      }
      // Re-lanzar otras excepciones
      throw error;
    }
    
    return null;
  }

  async refreshToken(refreshToken: string) {
    // Verificar el refresh token
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Buscar usuario
    const user = await this.usersService.findById(payload.sub);

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user);

    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    const authResponse: AuthResponseDto = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: userDto,
    };

    return authResponse;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Crear DTO específico para actualizar contraseña
    const updatePasswordDto: UpdatePasswordDto = {
      password: hashedNewPassword,
    };

    // Actualizar usando el repositorio
    await this.usersService.update(userId, updatePasswordDto);

    return 'Contraseña actualizada exitosamente';
  }
}
