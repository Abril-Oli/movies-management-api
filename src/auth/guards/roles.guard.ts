import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY, RoleName } from '../decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user?: { sub: number; email: string; roleId: number; role: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    if (!allowedRoles?.includes(request.user.role as RoleName)) {
      throw new ForbiddenException('Your role is not allowed to access this resource.');
    }

    return true;
  }
}