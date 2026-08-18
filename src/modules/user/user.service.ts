import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/common/repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RoleEnum, ProviderEnum } from 'src/common/enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(email: string) {
    const user = await this.userRepository.findOne({ filter: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const json = user.toJSON() as unknown as Record<string, unknown> & {
      password?: string;
    };
    const { password, ...profile } = json;
    return profile;
  }

  async changePassword(email: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ filter: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.userRepository.updateOne({
      filter: { email },
      update: {
        $set: {
          password: dto.newPassword,
          changeCredentialsTime: new Date(),
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
        },
      },
    });

    return { message: 'Password changed successfully', data: null };
  }

  /** Admin: paginated list of all non-deleted users */
  async listAll(page = 1, limit = 20) {
    const result = await this.userRepository.paginate({
      filter: {},
      page,
      limit,
      sort: 'createdAt',
      order: 'desc',
    });
    return result;
  }

  /** Admin: update a specific user's role */
  async updateRole(id: string, role: RoleEnum) {
    const user = await this.userRepository.findById({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.updateOne({
      filter: { _id: id },
      update: { $set: { role } },
    });

    return { message: `User role updated to ${role}`, data: null };
  }

  /** Admin: create a brand new admin account */
  async createAdmin(dto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existing = await this.userRepository.findOne({
      filter: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const fullName = `${dto.firstName} ${dto.lastName}`.trim();
    const slug =
      fullName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const user = await this.userRepository.createOne({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.toLowerCase().trim(),
        password: dto.password,
        phone: dto.phone,
        slug,
        role: RoleEnum.ADMIN,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: new Date(),
      },
    });

    const json = user.toJSON() as unknown as Record<string, unknown> & {
      password?: string;
      refreshTokenHash?: string;
    };
    delete json.password;
    delete json.refreshTokenHash;

    return { message: 'Admin account created successfully', data: json };
  }
}

