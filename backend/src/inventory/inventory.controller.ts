import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';
import { InventoryMovementQueryDto } from './dto/inventory-movement-query.dto';
import { MovementType, MovementReason } from './entities/inventory-movement.entity';
import { CustomResponse } from 'src/core/custom-response';

@Controller('inventory')
@UseInterceptors(ClassSerializerInterceptor)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Crear nuevo movimiento de inventario
   */
  @Post('movements')
  async createMovement(@Body() createInventoryMovementDto: CreateInventoryMovementDto) {
    try {
      const movement = await this.inventoryService.createMovement(createInventoryMovementDto);
      return CustomResponse.created('Movimiento de inventario creado exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener todos los movimientos de inventario con filtros y paginación
   */
  @Get('movements')
  async findAllMovements(@Query() queryDto: InventoryMovementQueryDto) {
    try {
      const result = await this.inventoryService.findAllMovements(queryDto);
      return CustomResponse.success('Movimientos de inventario obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimiento de inventario por ID
   */
  @Get('movements/:id')
  async findMovementById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const movement = await this.inventoryService.findMovementById(id);
      return CustomResponse.success('Movimiento de inventario encontrado', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar movimiento de inventario
   */
  @Patch('movements/:id')
  async updateMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryMovementDto: UpdateInventoryMovementDto,
  ) {
    try {
      const movement = await this.inventoryService.updateMovement(id, updateInventoryMovementDto);
      return CustomResponse.success('Movimiento de inventario actualizado exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar movimiento de inventario
   */
  @Delete('movements/:id')
  async deleteMovement(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.inventoryService.deleteMovement(id);
      return CustomResponse.success('Movimiento de inventario eliminado exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por producto
   */
  @Get('movements/product/:productId')
  async findMovementsByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByProduct(productId, queryDto);
      return CustomResponse.success('Movimientos por producto obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por variante
   */
  @Get('movements/variant/:variantId')
  async findMovementsByVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByVariant(variantId, queryDto);
      return CustomResponse.success('Movimientos por variante obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por tipo
   */
  @Get('movements/type/:type')
  async findMovementsByType(
    @Param('type') type: MovementType,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByType(type, queryDto);
      return CustomResponse.success('Movimientos por tipo obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por razón
   */
  @Get('movements/reason/:reason')
  async findMovementsByReason(
    @Param('reason') reason: MovementReason,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByReason(reason, queryDto);
      return CustomResponse.success('Movimientos por razón obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por ubicación
   */
  @Get('movements/location/:location')
  async findMovementsByLocation(
    @Param('location') location: string,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByLocation(location, queryDto);
      return CustomResponse.success('Movimientos por ubicación obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por rango de fechas
   */
  @Get('movements/date-range')
  async findMovementsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query() queryDto: InventoryMovementQueryDto,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const movements = await this.inventoryService.findMovementsByDateRange(start, end, queryDto);
      return CustomResponse.success('Movimientos por rango de fechas obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por referencia externa
   */
  @Get('movements/external-reference/:reference')
  async findMovementsByExternalReference(
    @Param('reference') reference: string,
    @Query('source') source?: string,
  ) {
    try {
      const movements = await this.inventoryService.findMovementsByExternalReference(reference, source);
      return CustomResponse.success('Movimientos por referencia externa obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos pendientes
   */
  @Get('movements/pending')
  async findPendingMovements() {
    try {
      const movements = await this.inventoryService.findPendingMovements();
      return CustomResponse.success('Movimientos pendientes obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos recientes
   */
  @Get('movements/recent')
  async findRecentMovements(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const movements = await this.inventoryService.findRecentMovements(limit);
      return CustomResponse.success('Movimientos recientes obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de movimientos
   */
  @Get('stats/movements')
  async getMovementStats(@Query() queryDto: InventoryMovementQueryDto) {
    try {
      const stats = await this.inventoryService.getMovementStats(queryDto);
      return CustomResponse.success('Estadísticas de movimientos obtenidas exitosamente', stats);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener análisis de stock
   */
  @Get('analysis/stock/:productId')
  async getStockAnalysis(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
  ) {
    try {
      const analysis = await this.inventoryService.getStockAnalysis(productId, variantId);
      return CustomResponse.success('Análisis de stock obtenido exitosamente', analysis);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener movimientos por período
   */
  @Get('reports/movements-by-period')
  async getMovementsByPeriod(
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const movements = await this.inventoryService.getMovementsByPeriod(period, start, end);
      return CustomResponse.success('Movimientos por período obtenidos exitosamente', movements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos más movidos
   */
  @Get('reports/top-moved-products')
  async getTopMovedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const period = startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate)
      } : undefined;
      const products = await this.inventoryService.getTopMovedProducts(limit, period);
      return CustomResponse.success('Productos más movidos obtenidos exitosamente', products);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  @Get('reports/low-stock')
  async getLowStockProducts(
    @Query('threshold', new DefaultValuePipe(10), ParseIntPipe) threshold: number,
  ) {
    try {
      const products = await this.inventoryService.getLowStockProducts(threshold);
      return CustomResponse.success('Productos con stock bajo obtenidos exitosamente', products);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener reporte de valor de stock
   */
  @Get('reports/stock-value')
  async getStockValueReport() {
    try {
      const report = await this.inventoryService.getStockValueReport();
      return CustomResponse.success('Reporte de valor de stock obtenido exitosamente', report);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener stock actual
   */
  @Get('stock/current/:productId')
  async getCurrentStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
    @Query('location') location?: string,
  ) {
    try {
      const stock = await this.inventoryService.getCurrentStock(productId, variantId, location);
      return CustomResponse.success('Stock actual obtenido exitosamente', { stock });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener historial de stock
   */
  @Get('stock/history/:productId')
  async getStockHistory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('variantId') variantId?: string,
  ) {
    try {
      const history = await this.inventoryService.getStockHistory(productId, variantId, days);
      return CustomResponse.success('Historial de stock obtenido exitosamente', history);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener proyección de stock
   */
  @Get('stock/projection/:productId')
  async getStockProjection(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('variantId') variantId?: string,
  ) {
    try {
      const projection = await this.inventoryService.getStockProjection(productId, variantId, days);
      return CustomResponse.success('Proyección de stock obtenida exitosamente', projection);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Validar disponibilidad de stock
   */
  @Get('stock/validate/:productId')
  async validateStockAvailability(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId: string,
    @Query('quantity', ParseIntPipe) quantity: number,
    @Query('location') location?: string,
  ) {
    try {
      const available = await this.inventoryService.validateStockAvailability(
        productId,
        variantId,
        quantity,
        location,
      );
      return CustomResponse.success('Disponibilidad de stock validada exitosamente', { available });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear múltiples movimientos
   */
  @Post('movements/bulk')
  async createBulkMovements(@Body('movements') movements: CreateInventoryMovementDto[]) {
    try {
      const createdMovements = await this.inventoryService.createBulkMovements(movements);
      return CustomResponse.created('Movimientos masivos creados exitosamente', createdMovements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar múltiples movimientos
   */
  @Patch('movements/bulk')
  async updateBulkMovements(
    @Body('updates') updates: Array<{ id: string; data: UpdateInventoryMovementDto }>,
  ) {
    try {
      const updatedMovements = await this.inventoryService.updateBulkMovements(updates);
      return CustomResponse.success('Movimientos masivos actualizados exitosamente', updatedMovements);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar múltiples movimientos
   */
  @Delete('movements/bulk')
  async deleteBulkMovements(@Body('ids') ids: string[]) {
    try {
      await this.inventoryService.deleteBulkMovements(ids);
      return CustomResponse.success('Movimientos masivos eliminados exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar si existe un movimiento
   */
  @Get('utils/movement-exists/:id')
  async movementExists(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const exists = await this.inventoryService.movementExists(id);
      return CustomResponse.success('Verificación completada', { exists });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Contar movimientos
   */
  @Get('utils/count-movements')
  async countMovements(@Query() queryDto: InventoryMovementQueryDto) {
    try {
      const count = await this.inventoryService.countMovements(queryDto);
      return CustomResponse.success('Conteo obtenido exitosamente', { count });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener último movimiento
   */
  @Get('utils/last-movement/:productId')
  async getLastMovement(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
  ) {
    try {
      const movement = await this.inventoryService.getLastMovement(productId, variantId);
      return CustomResponse.success('Último movimiento obtenido exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Calcular stock desde movimientos
   */
  @Get('utils/calculate-stock/:productId')
  async calculateStockFromMovements(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
    @Query('upToDate') upToDate?: string,
  ) {
    try {
      const upTo = upToDate ? new Date(upToDate) : undefined;
      const stock = await this.inventoryService.calculateStockFromMovements(productId, variantId, upTo);
      return CustomResponse.success('Stock calculado exitosamente', { stock });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear movimiento de entrada
   */
  @Post('movements/inbound/:productId')
  async createInboundMovement(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: {
      quantity: number;
      previousStock: number;
      reason: MovementReason;
      variantId?: string;
      location?: string;
      unitCost?: number;
      totalCost?: number;
      referenceType?: string;
      referenceId?: string;
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
    },
  ) {
    try {
      const movement = await this.inventoryService.createInboundMovement(
        productId,
        body.quantity,
        body.previousStock,
        body.reason,
        {
          variantId: body.variantId,
          location: body.location,
          unitCost: body.unitCost,
          totalCost: body.totalCost,
          referenceType: body.referenceType,
          referenceId: body.referenceId,
          referenceNumber: body.referenceNumber,
          notes: body.notes,
          performedBy: body.performedBy,
        },
      );
      return CustomResponse.created('Movimiento de entrada creado exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear movimiento de salida
   */
  @Post('movements/outbound/:productId')
  async createOutboundMovement(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: {
      quantity: number;
      previousStock: number;
      reason: MovementReason;
      variantId?: string;
      location?: string;
      unitCost?: number;
      totalCost?: number;
      referenceType?: string;
      referenceId?: string;
      referenceNumber?: string;
      notes?: string;
      performedBy?: string;
    },
  ) {
    try {
      const movement = await this.inventoryService.createOutboundMovement(
        productId,
        body.quantity,
        body.previousStock,
        body.reason,
        {
          variantId: body.variantId,
          location: body.location,
          unitCost: body.unitCost,
          totalCost: body.totalCost,
          referenceType: body.referenceType,
          referenceId: body.referenceId,
          referenceNumber: body.referenceNumber,
          notes: body.notes,
          performedBy: body.performedBy,
        },
      );
      return CustomResponse.created('Movimiento de salida creado exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear ajuste de stock
   */
  @Post('movements/adjustment/:productId')
  async createStockAdjustment(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: {
      newQuantity: number;
      currentStock: number;
      variantId?: string;
      location?: string;
      reason?: string;
      performedBy?: string;
    },
  ) {
    try {
      const movement = await this.inventoryService.createStockAdjustment(
        productId,
        body.newQuantity,
        body.currentStock,
        {
          variantId: body.variantId,
          location: body.location,
          reason: body.reason,
          performedBy: body.performedBy,
        },
      );
      return CustomResponse.created('Ajuste de stock creado exitosamente', movement);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }
}