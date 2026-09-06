import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AdminUsersQueryDto, UpdateUserAccessDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async listUsers(query: AdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? [
          { uid: ILike(`%${query.search}%`) },
          { displayName: ILike(`%${query.search}%`) },
        ]
      : {};

    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        uid: u.uid,
        displayName: u.displayName,
        createdAt: u.createdAt,
        contributedWordsCount: u.contributedWordsCount,
        freeAccessUntil: u.freeAccessUntil,
        rewardedGoalStreak: u.rewardedGoalStreak,
        isAdmin: u.isAdmin,
      })),
      total,
      page,
      limit,
    };
  }

  async updateUserAccess(id: string, dto: UpdateUserAccessDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    user.freeAccessUntil = dto.freeAccessUntil
      ? new Date(dto.freeAccessUntil)
      : null;
    await this.userRepo.save(user);

    return { id: user.id, freeAccessUntil: user.freeAccessUntil };
  }
}
