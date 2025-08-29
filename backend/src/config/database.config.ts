import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentVariables } from './env.interface';

export const databaseConfig = (configService: ConfigService<EnvironmentVariables>): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', { infer: true }),
  port: configService.get('DB_PORT', { infer: true }),
  username: configService.get('DB_USERNAME', { infer: true }),
  password: configService.get('DB_PASSWORD', { infer: true }),
  database: configService.get('DB_NAME', { infer: true }),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV', { infer: true }) !== 'production',
  // logging: configService.get('NODE_ENV', { infer: true }) === 'development',
  logging: false
});