import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';

export interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class UidAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const uid = request.headers['x-uid'];

    if (!uid || typeof uid !== 'string') {
      throw new UnauthorizedException('Missing x-uid header');
    }

    const user = await this.userService.findByUid(uid);
    if (!user) {
      throw new UnauthorizedException('Invalid uid');
    }

    request.user = user;
    return true;
  }
}
