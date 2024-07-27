import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Server, Socket } from "socket.io";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../entities/notification-type.entity";
import { Notification } from "../entities/notification.entity";
import { User } from "../entities/user.entity";
import { UsersService } from "../users/users.service";
import { Repository } from "typeorm";
import { Message } from "./interfaces/message.interface";

@Injectable()
export class NotificationsService {
  private server!: Server;
  private connectedUsers: Map<number, string>;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationType)
    private notificationTypesRepository: Repository<NotificationType>,
    private usersService: UsersService
  ) {
    this.connectedUsers = new Map();
  }

  setServer(server: Server) {
    this.server = server;
  }

  addNewUser(client: Socket, userID: number) {
    this.connectedUsers.set(userID, client.id);
  }

  removeUser(userID: number) {
    this.connectedUsers.delete(userID);
  }

  async notifyPostAuthor(
    authorID: number,
    postTitle: string,
    applicantUsername: string
  ) {
    const authorSocketID = this.connectedUsers.get(authorID);
    if (!authorSocketID) {
      try {
        await this.saveNotification(applicantUsername, postTitle, authorID);
      } catch (error) {
        console.error(error);
      }
    } else {
      const message = {
        message: `${applicantUsername} applied for your post: ${postTitle}`,
        type: NotificationTypeEnum.NEW_APPLICATION,
      };
      this.sendNotification(authorSocketID, "new application", message);
    }
  }

  private async saveNotification(
    applicantUsername: string,
    postTitle: string,
    authorID: number
  ) {
    const notification = new Notification();
    notification.content = `${applicantUsername} applied for your post: ${postTitle}`;
    notification.type = <NotificationType>(
      await this.notificationTypesRepository.findOne({
        where: { type: NotificationTypeEnum.NEW_APPLICATION },
      })
    );
    notification.receiver = <User>await this.usersService.findByID(authorID);
    await this.notificationsRepository.save(notification);
  }

  private sendNotification(
    socketID: string,
    channel: string,
    message: Message
  ) {
    this.server.to(socketID).emit(channel, message);
  }
}
