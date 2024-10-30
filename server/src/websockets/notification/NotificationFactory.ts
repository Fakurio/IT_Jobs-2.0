import { NotificationTypeEnum } from "../../entities/notification-type.entity";
import {
  NewApplicationArgs,
  NotificationArgs,
} from "../interfaces/notification-args.interface";
import { NotificationMessage } from "../interfaces/notification-message.interface";
import { NewApplicationNotification } from "./NewApplicationNotification";
import { PostRejectedNotification } from "./PostRejectedNotification";
import { ApplicationReviewedNotification } from "./ApplicationReviewedNotification";
import { NotificationChannel } from "../enums/notification-channel";

export class NotificationFactory {
  static createNotification(
    type: NotificationTypeEnum,
    args: NotificationArgs
  ): NotificationMessage {
    switch (type) {
      case NotificationTypeEnum.NEW_APPLICATION:
        return new NewApplicationNotification(
          args as NewApplicationArgs,
          NotificationChannel.NEW_APPLICATION
        );
      case NotificationTypeEnum.POST_REJECTED:
        return new PostRejectedNotification(
          args,
          NotificationChannel.POST_REJECTED
        );
      case NotificationTypeEnum.STATUS_CHANGE:
        return new ApplicationReviewedNotification(
          args,
          NotificationChannel.STATUS_CHANGE
        );
      default:
        throw new Error("Invalid notification type");
    }
  }
}
