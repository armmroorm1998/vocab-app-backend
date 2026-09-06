import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequestWithUser } from './uid-auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
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
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    request.user = user;
    return true;
  }
}
