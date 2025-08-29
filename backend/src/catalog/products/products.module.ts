import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage])
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository
  ],
  exports: [
    ProductsService,
    ProductRepository
  ]
})
export class ProductsModule {}