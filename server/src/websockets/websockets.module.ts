import { Module, forwardRef } from "@nestjs/common";
import { WebSocketsService } from "./websockets.service";
import { WebSocketsGateway } from "./websockets.gateway";
import { Notification } from "src/entities/notification.entity";
import { NotificationType } from "src/entities/notification-type.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationType]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [WebSocketsGateway, WebSocketsService],
  exports: [WebSocketsService],
})
export class WebSocketsModule {}
