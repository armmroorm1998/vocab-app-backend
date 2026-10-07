import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserActivityService } from '../user/user-activity.service';
import { AdminUsersQueryDto, UpdateUserAccessDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userActivityService: UserActivityService,
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

    const goalMetStreaks = await this.userActivityService.getGoalMetStreaks(
      users.map((u) => u.id),
    );

    return {
      data: users.map((u) => ({
        id: u.id,
        uid: u.uid,
        displayName: u.displayName,
        createdAt: u.createdAt,
        contributedWordsCount: u.contributedWordsCount,
        freeAccessUntil: u.freeAccessUntil,
        rewardedGoalStreak: u.rewardedGoalStreak,
        goalMetStreak: goalMetStreaks.get(u.id) ?? 0,
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
