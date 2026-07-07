import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from './uid-auth.guard';
import { User } from './user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
