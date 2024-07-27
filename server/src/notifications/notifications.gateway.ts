import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { NotificationsService } from "./notifications.service";

@WebSocketGateway({
  namespace: "notifications",
  cors: { origin: "http://localhost:3001" },
})
export class NotificationsGateway implements OnGatewayInit {
  constructor(private notificationsService: NotificationsService) {}

  afterInit(server: Server) {
    this.notificationsService.setServer(server);
  }

  @SubscribeMessage("new user")
  connectNewUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userID: number
  ) {
    this.notificationsService.addNewUser(client, userID);
  }
}
