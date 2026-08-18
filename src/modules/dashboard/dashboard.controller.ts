import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RoleEnum } from 'src/common/enum';

@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getStats();
  }

  @Get('recent-orders')
  async getRecentOrders() {
    return await this.dashboardService.getRecentOrders();
  }

  @Get('best-sellers')
  async getBestSellingProducts() {
    return await this.dashboardService.getBestSellingProducts();
  }

  @Get('cart-wishlist-analytics')
  async getCartWishlistAnalytics() {
    return await this.dashboardService.getCartWishlistAnalytics();
  }
}

