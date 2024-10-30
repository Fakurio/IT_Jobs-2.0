import { NotificationTypeEnum } from "../../entities/notification-type.entity";
import { NotificationMessage } from "../interfaces/notification-message.interface";
import { ApplicationReviewedArgs } from "../interfaces/notification-args.interface";
import { NotificationChannel } from "../enums/notification-channel";

export class ApplicationReviewedNotification implements NotificationMessage {
  content: string;
  type: NotificationTypeEnum;
  channel: NotificationChannel;

  constructor(args: ApplicationReviewedArgs, channel: NotificationChannel) {
    this.content = `Your application for post ${args.postTitle} has been reviewed`;
    this.type = NotificationTypeEnum.STATUS_CHANGE;
    this.channel = channel;
  }
}
