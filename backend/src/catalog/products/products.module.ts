import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRepository } from './repositories/product.repository';
import { CategoriesModule } from '../categories/categories.module';
import { Category } from '../categories/entities/category.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/auth/users/users.service';
import { UsersModule } from 'src/auth/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage, Category]),
    CategoriesModule,
    UsersModule
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    JwtService,
    UsersService,

  ],
  exports: [
    ProductsService,
    ProductRepository
  ]
})
export class ProductsModule {}