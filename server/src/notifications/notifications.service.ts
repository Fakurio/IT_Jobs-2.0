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
import { NotificationMessage } from "./interfaces/notification-message.interface";

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
    console.log(this.connectedUsers);
  }

  removeUser(userID: number) {
    this.connectedUsers.delete(userID);
  }

  async getNotificationsForUser(userID: number) {
    return await this.notificationsRepository
      .createQueryBuilder("notification")
      .select(["notification.id", "notification.content"])
      .innerJoinAndSelect("notification.type", "type")
      .innerJoin("notification.receiver", "receiver")
      .where("receiver.id = :userID", { userID })
      .andWhere("notification.read = false")
      .getMany();
  }

  async updateNotificationsReadStatus(notifications: Notification[]) {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    return this.notificationsRepository.save(updatedNotifications);
  }

  async notifyPostAuthor(
    authorID: number,
    postTitle: string,
    applicantUsername: string
  ) {
    const authorSocketID = this.connectedUsers.get(authorID);
    const notification = {
      message: `${applicantUsername} applied for your post: ${postTitle}`,
      type: NotificationTypeEnum.NEW_APPLICATION,
    };
    if (!authorSocketID) {
      try {
        await this.saveNotification(
          notification.message,
          notification.type,
          authorID
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      this.sendNotification(authorSocketID, "new application", notification);
    }
  }

  async notifyApplicant(applicantID: number, postTitle: string) {
    const applicantSocketID = this.connectedUsers.get(applicantID);
    const notification = {
      message: `Your application for post ${postTitle} has been reviewed`,
      type: NotificationTypeEnum.STATUS_CHANGE,
    };
    if (!applicantSocketID) {
      try {
        await this.saveNotification(
          notification.message,
          notification.type,
          applicantID
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      this.sendNotification(applicantSocketID, "status change", notification);
    }
  }

  private async saveNotification(
    content: string,
    type: NotificationTypeEnum,
    receiverID: number
  ) {
    const notification = new Notification();
    notification.content = content;
    notification.type = <NotificationType>(
      await this.notificationTypesRepository.findOne({
        where: { type },
      })
    );
    notification.receiver = <User>await this.usersService.findByID(receiverID);
    await this.notificationsRepository.save(notification);
  }

  private sendNotification(
    socketID: string,
    channel: string,
    message: NotificationMessage
  ) {
    this.server.to(socketID).emit(channel, message);
  }
}
