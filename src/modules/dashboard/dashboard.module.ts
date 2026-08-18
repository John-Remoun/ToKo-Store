import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CartModel, OrderModel, ProductModel, UserModel } from 'src/model';

@Module({
  imports: [OrderModel, ProductModel, UserModel, CartModel],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
