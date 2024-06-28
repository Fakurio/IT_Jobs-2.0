import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from "@nestjs/common";
import { HashService } from "../hash/hash.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CheckCsrfTokenInterceptor implements NestInterceptor {
  constructor(
    private hashService: HashService,
    private configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers["x-csrf-token"];
    if (!token) {
      throw new UnauthorizedException();
    }
    const tokenPayload =
      request.sessionID + this.configService.get("CSRF_SECRET");
    const isValid = await this.hashService.verifyPassword(tokenPayload, token);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return next.handle();
  }
}
