import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { WebSocketsService } from "./websockets.service";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { Request } from "express";
import { User } from "../entities/user.entity";

@Controller("chat")
export class ChatController {
  constructor(private webSocketsService: WebSocketsService) {}

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/")
  async getChatHistoryWithGivenUser(
    @Req() request: Request,
    @Query("user") userUsername: string
  ) {
    const authenticatedUser = request.user as User;
    return await this.webSocketsService.getChatHistoryWithGivenUser(
      authenticatedUser,
      userUsername
    );
  }

  //return all users' usernames that the authenticated user has chatted with
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/users")
  async getChatUsernames(@Req() request: Request) {
    const authenticatedUser = request.user as User;
    return await this.webSocketsService.getChatUsernames(authenticatedUser);
  }
}
