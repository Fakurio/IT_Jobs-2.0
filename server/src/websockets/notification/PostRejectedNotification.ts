import { NotificationTypeEnum } from "../../entities/notification-type.entity";
import { NotificationMessage } from "../interfaces/notification-message.interface";
import { PostRejectedArgs } from "../interfaces/notification-args.interface";
import { NotificationChannel } from "../enums/notification-channel";

export class PostRejectedNotification implements NotificationMessage {
  content: string;
  type: NotificationTypeEnum;
  channel: NotificationChannel;

  constructor(args: PostRejectedArgs, channel: NotificationChannel) {
    this.content = `Moderator has rejected your post: ${args.postTitle}`;
    this.type = NotificationTypeEnum.POST_REJECTED;
    this.channel = channel;
  }
}
