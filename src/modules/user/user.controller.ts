import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import type { IUser } from 'src/common/interface/user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RoleEnum } from 'src/common/enum';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AdminUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

class UpdateRoleDto {
  @IsEnum(RoleEnum)
  role!: RoleEnum;
}

@Controller({ path: 'user', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** GET /api/v1/user — current user's profile */
  @Get()
  async profile(@CurrentUser() user: IUser) {
    const profile = await this.userService.getProfile(user.email);
    return { message: 'Profile retrieved', data: profile };
  }

  /** PATCH /api/v1/user/password — change own password */
  @Patch('password')
  async changePassword(
    @CurrentUser() user: IUser,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(user.email, body);
  }

  // ─── Admin-only ─────────────────────────────────────────────────────────────

  /** GET /api/v1/user/admin/list — paginated list of all users */
  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async adminListUsers(@Query() query: AdminUsersQueryDto) {
    const result = await this.userService.listAll(query.page, query.limit);
    return { message: 'Users retrieved', data: result };
  }

  /** PATCH /api/v1/user/admin/:id/role — change a user's role */
  @Patch('admin/:id/role')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async adminUpdateRole(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ) {
    return await this.userService.updateRole(id, body.role);
  }

  /** POST /api/v1/user/admin/create-admin — create another admin account */
  @Post('admin/create-admin')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async adminCreateAdmin(@Body() body: CreateAdminDto) {
    return await this.userService.createAdmin(body);
  }
}

