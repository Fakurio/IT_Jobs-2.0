import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  ConnectedSocket,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebSocketsService } from "./websockets.service";
import { ChatMessage } from "./interfaces/chat-message.interface";
import { UseFilters } from "@nestjs/common";
import { WSExceptionsFilter } from "../filters/ws.filter";

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

  @UseFilters(new WSExceptionsFilter())
  @SubscribeMessage("chat message")
  handleChatMessage(@MessageBody() message: ChatMessage) {
    return this.webSocketsService.handleChatMessage(message);
  }
}
