import { Module, forwardRef } from "@nestjs/common";
import { WebSocketsService } from "./websockets.service";
import { WebSocketsGateway } from "./websockets.gateway";
import { Notification } from "../entities/notification.entity";
import { NotificationType } from "../entities/notification-type.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { Message } from "../entities/message.entity";
import { ChatController } from "./chat.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationType, Message]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [WebSocketsGateway, WebSocketsService],
  controllers: [ChatController],
  exports: [WebSocketsService],
})
export class WebSocketsModule {}
