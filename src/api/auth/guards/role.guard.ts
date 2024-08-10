import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/api/shared/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.role == Role.SUPERADMIN) return true;

    if (!requiredRoles.some((role) => user.role == role))
      throw new BadRequestException(
        'Access denied. You do not have permission',
      );
    return true;
  }
}
