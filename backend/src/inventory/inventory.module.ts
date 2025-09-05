import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { StockAlert } from './entities/stock-alert.entity';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository';
import { StockAlertRepository } from './repositories/stock-alert.repository';
import { InventoryService } from './inventory.service';
import { StockAlertService } from './stock-alert.service';
import { InventoryController } from './inventory.controller';
import { StockAlertController } from './stock-alert.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryMovement,
      StockAlert,
    ]),
  ],
  controllers: [
    InventoryController,
    StockAlertController,
  ],
  providers: [
    InventoryService,
    StockAlertService,
    InventoryMovementRepository,
    StockAlertRepository,
  ],
  exports: [
    InventoryService,
    StockAlertService,
    InventoryMovementRepository,
    StockAlertRepository,
  ],
})
export class InventoryModule {}