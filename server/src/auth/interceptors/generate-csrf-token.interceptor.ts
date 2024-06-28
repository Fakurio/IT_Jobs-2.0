import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { HashService } from "../hash/hash.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GenerateCsrfTokenInterceptor implements NestInterceptor {
  constructor(
    private hashService: HashService,
    private configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const tokenPayload =
      request.sessionID + this.configService.get<string>("CSRF_SECRET");
    const token = await this.hashService.hashPassword(tokenPayload);
    response.setHeader("x-csrf-token", token);
    return next.handle();
  }
}
