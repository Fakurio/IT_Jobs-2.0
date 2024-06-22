import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IsAuthenticated implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as Request;
    if (!request.isAuthenticated()) {
      throw new UnauthorizedException('Session does not exist or has expired');
    }
    return true;
  }
}
