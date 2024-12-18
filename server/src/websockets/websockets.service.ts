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
import { ChatMessage } from "./interfaces/chat-message.interface";
import { WsException } from "@nestjs/websockets";
import { Message } from "../entities/message.entity";
import { NotificationArgs } from "./interfaces/notification-args.interface";
import { NotificationFactory } from "./notification/NotificationFactory";

@Injectable()
export class WebSocketsService {
  private server!: Server;
  private connectedUsers: Map<number, string>;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(NotificationType)
    private notificationTypesRepository: Repository<NotificationType>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService
  ) {
    this.connectedUsers = new Map();
  }

  setServer(server: Server) {
    this.server = server;
  }

  async addNewUser(client: Socket, userID: number) {
    this.connectedUsers.set(userID, client.id);
    // console.log(this.connectedUsers);
  }

  removeUser(userID: number) {
    this.connectedUsers.delete(userID);
    // console.log(this.connectedUsers);
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
    type: NotificationTypeEnum,
    args: NotificationArgs
  ) {
    const authorSocketID = this.connectedUsers.get(authorID);
    const notification = NotificationFactory.createNotification(type, args);
    if (!authorSocketID) {
      try {
        await this.saveNotification(notification, authorID);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.sendNotification(authorSocketID, notification);
    }
  }

  async notifyApplicant(
    applicantID: number,
    type: NotificationTypeEnum,
    args: NotificationArgs
  ) {
    const applicantSocketID = this.connectedUsers.get(applicantID);
    const notification = NotificationFactory.createNotification(type, args);
    if (!applicantSocketID) {
      try {
        await this.saveNotification(notification, applicantID);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.sendNotification(applicantSocketID, notification);
    }
  }

  async handleChatMessage(message: ChatMessage) {
    console.log("Wysyłam wiadomość", message);
    const receiver = await this.usersService.findByUsername(message.receiver);
    const sender = (await this.usersService.findByUsername(
      message.sender.username
    )) as User;
    if (!receiver) {
      throw new WsException("Receiver not found");
    }
    const receiverSocketID = this.connectedUsers.get(receiver.id);
    if (receiverSocketID) {
      this.server.to(receiverSocketID).emit("chat message", message.content);
    }
    await this.saveMessage(message.content, receiver, sender);
  }

  async getChatHistoryWithGivenUser(user: User, userUsername: string) {
    const [sentMessages, sentParameters] = this.messagesRepository
      .createQueryBuilder("message")
      .innerJoin("message.sender", "sender")
      .innerJoin("message.receiver", "receiver")
      .select(["sender.username, message.content, message.createdAt"])
      .where("sender.id = :userID", { userID: user.id })
      .andWhere("receiver.username = :userUsername", { userUsername })
      .getQueryAndParameters();
    const [receivedMessages, receivedParameters] = this.messagesRepository
      .createQueryBuilder("message")
      .innerJoin("message.sender", "sender")
      .innerJoin("message.receiver", "receiver")
      .select(["sender.username, message.content, message.createdAt"])
      .where("sender.username = :userUsername", { userUsername })
      .andWhere("receiver.id = :userID", { userID: user.id })
      .getQueryAndParameters();
    const chatHistory = await this.messagesRepository.query(
      `${sentMessages} UNION ALL ${receivedMessages}`,
      [...sentParameters, ...receivedParameters]
    );
    return { chatHistory: this.sortChatHistory(chatHistory, userUsername) };
  }

  async getChatUsernames(user: User) {
    const [sentUsernames, sentParameters] = this.messagesRepository
      .createQueryBuilder("message")
      .select("receiver.username", "username")
      .innerJoin("message.sender", "sender")
      .innerJoin("message.receiver", "receiver")
      .where("sender.id = :userID", { userID: user.id })
      .getQueryAndParameters();
    const [receivedUsernames, receivedParameters] = this.messagesRepository
      .createQueryBuilder("message")
      .select("sender.username", "username")
      .innerJoin("message.receiver", "receiver")
      .innerJoin("message.sender", "sender")
      .where("receiver.id = :userID", { userID: user.id })
      .getQueryAndParameters();

    const chatUsernames = await this.messagesRepository.query(
      `${sentUsernames} UNION ${receivedUsernames}`,
      [...sentParameters, ...receivedParameters]
    );
    return { chatUsernames: chatUsernames.map((el) => el.username) };
  }

  private sortChatHistory(
    chatHistory: { content: string; createdAt: Date; username: string }[],
    userUsername: string
  ) {
    chatHistory.sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
    return chatHistory.map((msg) => {
      return {
        content: msg.content,
        createdAt: new Date(`${msg.createdAt} UTC`),
        type: msg.username === userUsername ? "received" : "sent",
      };
    });
  }

  private async saveMessage(content: string, receiver: User, sender: User) {
    const messageEntity = new Message();
    messageEntity.content = content;
    messageEntity.receiver = receiver;
    messageEntity.sender = sender;
    await this.messagesRepository.save(messageEntity);
  }

  private async saveNotification(
    notification: NotificationMessage,
    receiverID: number
  ) {
    const newNotification = new Notification();
    newNotification.content = notification.content;
    newNotification.type = <NotificationType>(
      await this.notificationTypesRepository.findOne({
        where: { type: notification.type },
      })
    );
    newNotification.receiver = <User>(
      await this.usersService.findByID(receiverID)
    );
    await this.notificationsRepository.save(newNotification);
  }

  private sendNotification(
    socketID: string,
    notification: NotificationMessage
  ) {
    this.server.to(socketID).emit(notification.channel, notification);
  }
}
