import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebSocketsService } from "./websockets.service";
import { ChatMessage } from "./interfaces/chat-message.interface";
import { UseFilters, UseGuards } from "@nestjs/common";
import { WSExceptionsFilter } from "../filters/ws.filter";
import { IsSessionValidGuard } from "./guards/is-session-valid.guard";

@WebSocketGateway({
  cors: { origin: "http://localhost:3001" },
})
export class WebSocketsGateway implements OnGatewayInit {
  constructor(private webSocketsService: WebSocketsService) {}

  afterInit(server: Server) {
    this.webSocketsService.setServer(server);
  }

  @SubscribeMessage("new user")
  connectNewUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userID: number
  ) {
    this.webSocketsService.addNewUser(client, userID);
  }

  @SubscribeMessage("disconnect user")
  disconnectUser(@MessageBody() userID: number) {
    this.webSocketsService.removeUser(userID);
  }

  @UseFilters(new WSExceptionsFilter())
  @UseGuards(IsSessionValidGuard)
  @SubscribeMessage("chat message")
  handleChatMessage(@MessageBody() message: ChatMessage) {
    return this.webSocketsService.handleChatMessage(message);
  }
}
