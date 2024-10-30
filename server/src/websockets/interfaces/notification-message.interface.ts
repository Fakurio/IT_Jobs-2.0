import { NotificationTypeEnum } from "../../entities/notification-type.entity";
import { NotificationChannel } from "../enums/notification-channel";

export interface NotificationMessage {
  content: string;
  type: NotificationTypeEnum;
  channel: NotificationChannel;
}
