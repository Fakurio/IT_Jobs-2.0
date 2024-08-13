import { Injectable, ExecutionContext, CanActivate } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ChatMessage } from "../interfaces/chat-message.interface";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class IsSessionValidGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const data: ChatMessage = context.switchToWs().getData();
    try {
      const sessionExpiryTime =
        await this.authService.getSessionExpiryTimeForUser(data.sender.id);
      const isValid = new Date(Number(sessionExpiryTime)) > new Date();
      if (!isValid) {
        throw new WsException("Unauthorized");
      }
    } catch (error) {
      throw new WsException("Unauthorized");
    }

    return true;
  }
}
