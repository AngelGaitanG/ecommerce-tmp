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
  ParseEnumPipe,
} from '@nestjs/common';
import { StockAlertService } from './stock-alert.service';
import {
  CreateStockAlertDto,
  UpdateStockAlertDto,
  StockAlertQueryDto,
  AcknowledgeAlertDto,
  ResolveAlertDto,
  DismissAlertDto,
} from './dto';
import { AlertType, AlertPriority, AlertStatus } from './entities/stock-alert.entity';
import { CustomResponse } from '../core/custom-response';

@Controller('stock-alerts')
@UseInterceptors(ClassSerializerInterceptor)
export class StockAlertController {
  constructor(private readonly stockAlertService: StockAlertService) {}

  /**
   * Crear nueva alerta de stock
   */
  @Post()
  async create(@Body() createStockAlertDto: CreateStockAlertDto) {
    try {
      const alert = await this.stockAlertService.create(createStockAlertDto);
      return CustomResponse.created('Alerta de stock creada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener todas las alertas con filtros y paginación
   */
  @Get()
  async findAll(@Query() queryDto: StockAlertQueryDto) {
    try {
      const result = await this.stockAlertService.findAll(queryDto);
      return CustomResponse.success('Alertas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas activas
   */
  @Get('active')
  async findActive(@Query() queryDto: StockAlertQueryDto) {
    try {
      const result = await this.stockAlertService.findActive(queryDto);
      return CustomResponse.success('Alertas activas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas pendientes
   */
  @Get('pending')
  async findPending(@Query() queryDto: StockAlertQueryDto) {
    try {
      const result = await this.stockAlertService.findPending(queryDto);
      return CustomResponse.success('Alertas pendientes obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas críticas
   */
  @Get('critical')
  async findCritical(@Query() queryDto: StockAlertQueryDto) {
    try {
      const result = await this.stockAlertService.findCritical(queryDto);
      return CustomResponse.success('Alertas críticas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas expiradas
   */
  @Get('expired')
  async findExpired(@Query() queryDto: StockAlertQueryDto) {
    try {
      const result = await this.stockAlertService.findExpired(queryDto);
      return CustomResponse.success('Alertas expiradas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por tipo
   */
  @Get('type/:type')
  async findByType(
    @Param('type', new ParseEnumPipe(AlertType)) type: AlertType,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByType(type, queryDto);
      return CustomResponse.success('Alertas por tipo obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por prioridad
   */
  @Get('priority/:priority')
  async findByPriority(
    @Param('priority', new ParseEnumPipe(AlertPriority)) priority: AlertPriority,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByPriority(priority, queryDto);
      return CustomResponse.success('Alertas por prioridad obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por estado
   */
  @Get('status/:status')
  async findByStatus(
    @Param('status', new ParseEnumPipe(AlertStatus)) status: AlertStatus,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByStatus(status, queryDto);
      return CustomResponse.success('Alertas por estado obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por ubicación
   */
  @Get('location/:location')
  async findByLocation(
    @Param('location') location: string,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByLocation(location, queryDto);
      return CustomResponse.success('Alertas por ubicación obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por producto
   */
  @Get('product/:productId')
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByProduct(productId, queryDto);
      return CustomResponse.success('Alertas por producto obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por variante de producto
   */
  @Get('variant/:variantId')
  async findByVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const result = await this.stockAlertService.findByVariant(variantId, queryDto);
      return CustomResponse.success('Alertas por variante obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas por rango de fechas
   */
  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query() queryDto: StockAlertQueryDto,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const result = await this.stockAlertService.findByDateRange(start, end, queryDto);
      return CustomResponse.success('Alertas por rango de fechas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  @Get('stats')
  async getAlertStats(@Query() queryDto: StockAlertQueryDto) {
    try {
      const stats = await this.stockAlertService.getAlertStats(queryDto);
      return CustomResponse.success('Estadísticas de alertas obtenidas exitosamente', stats);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas agrupadas por tipo
   */
  @Get('stats/by-type')
  async getAlertsByType() {
    try {
      const result = await this.stockAlertService.getAlertsByType();
      return CustomResponse.success('Alertas por tipo obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alertas agrupadas por prioridad
   */
  @Get('stats/by-priority')
  async getAlertsByPriority() {
    try {
      const result = await this.stockAlertService.getAlertsByPriority();
      return CustomResponse.success('Alertas por prioridad obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener tendencias de alertas
   */
  @Get('stats/trends')
  async getAlertTrends(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    try {
      const result = await this.stockAlertService.getAlertTrends(days);
      return CustomResponse.success('Tendencias de alertas obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener estadísticas de tiempo de respuesta
   */
  @Get('stats/response-time')
  async getResponseTimeStats() {
    try {
      const result = await this.stockAlertService.getResponseTimeStats();
      return CustomResponse.success('Estadísticas de tiempo de respuesta obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener productos con más alertas
   */
  @Get('stats/top-alerted-products')
  async getTopAlertedProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const result = await this.stockAlertService.getTopAlertedProducts(limit);
      return CustomResponse.success('Productos con más alertas obtenidos exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener notificaciones pendientes
   */
  @Get('notifications/pending')
  async findPendingNotifications() {
    try {
      const result = await this.stockAlertService.findPendingNotifications();
      return CustomResponse.success('Notificaciones pendientes obtenidas exitosamente', result);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Obtener alerta por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const alert = await this.stockAlertService.findOne(id);
      return CustomResponse.success('Alerta encontrada', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar alerta
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockAlertDto: UpdateStockAlertDto,
  ) {
    try {
      const alert = await this.stockAlertService.update(id, updateStockAlertDto);
      return CustomResponse.success('Alerta actualizada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar alerta
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.stockAlertService.remove(id);
      return CustomResponse.success('Alerta eliminada exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Reconocer alerta
   */
  @Patch(':id/acknowledge')
  async acknowledge(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
  ) {
    try {
      const alert = await this.stockAlertService.acknowledge(id, acknowledgeDto);
      return CustomResponse.success('Alerta reconocida exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Resolver alerta
   */
  @Patch(':id/resolve')
  async resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resolveDto: ResolveAlertDto,
  ) {
    try {
      const alert = await this.stockAlertService.resolve(id, resolveDto);
      return CustomResponse.success('Alerta resuelta exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Descartar alerta
   */
  @Patch(':id/dismiss')
  async dismiss(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dismissDto: DismissAlertDto,
  ) {
    try {
      const alert = await this.stockAlertService.dismiss(id, dismissDto);
      return CustomResponse.success('Alerta descartada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Reactivar alerta
   */
  @Patch(':id/reactivate')
  async reactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    try {
      const alert = await this.stockAlertService.reactivate(id, reason);
      return CustomResponse.success('Alerta reactivada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Posponer alerta
   */
  @Patch(':id/snooze')
  async snooze(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('until') until: string,
    @Body('reason') reason?: string,
  ) {
    try {
      const untilDate = new Date(until);
      const alert = await this.stockAlertService.snooze(id, untilDate, reason);
      return CustomResponse.success('Alerta pospuesta exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Escalar alerta
   */
  @Patch(':id/escalate')
  async escalate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newPriority', new ParseEnumPipe(AlertPriority)) newPriority: AlertPriority,
    @Body('reason') reason?: string,
  ) {
    try {
      const alert = await this.stockAlertService.escalate(id, newPriority, reason);
      return CustomResponse.success('Alerta escalada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Marcar notificación como enviada
   */
  @Patch(':id/notification/sent')
  async markNotificationSent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('channel') channel: string,
  ) {
    try {
      await this.stockAlertService.markNotificationSent(id, channel);
      return CustomResponse.success('Notificación marcada como enviada exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Marcar notificación como fallida
   */
  @Patch(':id/notification/failed')
  async markNotificationFailed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('channel') channel: string,
    @Body('error') errorMessage: string,
  ) {
    try {
      await this.stockAlertService.markNotificationFailed(id, channel, errorMessage);
      return CustomResponse.success('Notificación marcada como fallida exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Resetear estado de notificación
   */
  @Patch(':id/notification/reset')
  async resetNotificationStatus(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.stockAlertService.resetNotificationStatus(id);
      return CustomResponse.success('Estado de notificación reseteado exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear alertas en lote
   */
  @Post('batch')
  async createBatch(@Body('alerts') createDtos: CreateStockAlertDto[]) {
    try {
      const alerts = await this.stockAlertService.createBatch(createDtos);
      return CustomResponse.created('Alertas creadas en lote exitosamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Actualizar alertas en lote
   */
  @Patch('batch')
  async updateBatch(
    @Body('updates') updates: Array<{ id: string; data: UpdateStockAlertDto }>,
  ) {
    try {
      const alerts = await this.stockAlertService.updateBatch(updates);
      return CustomResponse.success('Alertas actualizadas en lote exitosamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Eliminar alertas en lote
   */
  @Delete('batch')
  async removeBatch(@Body('ids') ids: string[]) {
    try {
      await this.stockAlertService.removeBatch(ids);
      return CustomResponse.success('Alertas eliminadas en lote exitosamente');
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Reconocer alertas en lote
   */
  @Patch('batch/acknowledge')
  async acknowledgeBatch(
    @Body('ids') ids: string[],
    @Body('data') acknowledgeDto: AcknowledgeAlertDto,
  ) {
    try {
      const alerts = await this.stockAlertService.acknowledgeBatch(ids, acknowledgeDto);
      return CustomResponse.success('Alertas reconocidas en lote exitosamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Resolver alertas en lote
   */
  @Patch('batch/resolve')
  async resolveBatch(
    @Body('ids') ids: string[],
    @Body('data') resolveDto: ResolveAlertDto,
  ) {
    try {
      const alerts = await this.stockAlertService.resolveBatch(ids, resolveDto);
      return CustomResponse.success('Alertas resueltas en lote exitosamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Descartar alertas en lote
   */
  @Patch('batch/dismiss')
  async dismissBatch(
    @Body('ids') ids: string[],
    @Body('data') dismissDto: DismissAlertDto,
  ) {
    try {
      const alerts = await this.stockAlertService.dismissBatch(ids, dismissDto);
      return CustomResponse.success('Alertas descartadas en lote exitosamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Verificar si la alerta existe
   */
  @Get('utils/exists/:id')
  async exists(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const exists = await this.stockAlertService.exists(id);
      return CustomResponse.success('Verificación completada', { exists });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Contar alertas con filtros opcionales
   */
  @Get('utils/count')
  async count(@Query() queryDto: StockAlertQueryDto) {
    try {
      const count = await this.stockAlertService.count(queryDto);
      return CustomResponse.success('Conteo obtenido exitosamente', { count });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Buscar alertas duplicadas
   */
  @Get('utils/duplicates')
  async findDuplicates(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Query('variantId') variantId?: string,
    @Query('type', new ParseEnumPipe(AlertType)) type?: AlertType,
  ) {
    try {
      const duplicates = await this.stockAlertService.findDuplicates(productId, variantId, type);
      return CustomResponse.success('Alertas duplicadas encontradas', duplicates);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Limpiar alertas expiradas
   */
  @Delete('utils/cleanup-expired')
  async cleanupExpiredAlerts(
    @Query('olderThanDays', new DefaultValuePipe(90), ParseIntPipe) olderThanDays: number,
  ) {
    try {
      const count = await this.stockAlertService.cleanupExpiredAlerts(olderThanDays);
      return CustomResponse.success('Alertas expiradas limpiadas exitosamente', { count });
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Resolver alertas automáticamente
   */
  @Patch('utils/auto-resolve')
  async autoResolveAlerts(
    @Body('productId', ParseUUIDPipe) productId: string,
    @Body('variantId') variantId?: string,
  ) {
    try {
      const alerts = await this.stockAlertService.autoResolveAlerts(productId, variantId);
      return CustomResponse.success('Alertas resueltas automáticamente', alerts);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear alerta de stock bajo
   */
  @Post('utils/create-low-stock')
  async createLowStockAlert(
    @Body('productId', ParseUUIDPipe) productId: string,
    @Body('productVariantId', ParseUUIDPipe) productVariantId: string,
    @Body('currentStock', ParseIntPipe) currentStock: number,
    @Body('thresholdValue', ParseIntPipe) thresholdValue: number,
    @Body('location') location?: string,
  ) {
    try {
      const alert = await this.stockAlertService.createLowStockAlert(
        productId,
        productVariantId,
        currentStock,
        thresholdValue,
        location,
      );
      return CustomResponse.created('Alerta de stock bajo creada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

  /**
   * Crear alerta de stock agotado
   */
  @Post('utils/create-out-of-stock')
  async createOutOfStockAlert(
    @Body('productId', ParseUUIDPipe) productId: string,
    @Body('productVariantId', ParseUUIDPipe) productVariantId: string,
    @Body('location') location?: string,
  ) {
    try {
      const alert = await this.stockAlertService.createOutOfStockAlert(
        productId,
        productVariantId,
        location,
      );
      return CustomResponse.created('Alerta de stock agotado creada exitosamente', alert);
    } catch (error) {
      return CustomResponse.error(error);
    }
  }

}