import { NotificationTypeEnum } from "../../entities/notification-type.entity";
import { NotificationMessage } from "../interfaces/notification-message.interface";
import { NewApplicationArgs } from "../interfaces/notification-args.interface";
import { NotificationChannel } from "../enums/notification-channel";

export class NewApplicationNotification implements NotificationMessage {
  content: string;
  type: NotificationTypeEnum;
  channel: NotificationChannel;

  constructor(args: NewApplicationArgs, channel: NotificationChannel) {
    this.content = `${args.applicantUsername} has applied to your post: ${args.postTitle}`;
    this.type = NotificationTypeEnum.NEW_APPLICATION;
    this.channel = channel;
  }
}
