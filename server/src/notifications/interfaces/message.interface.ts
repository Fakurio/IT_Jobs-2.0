import { NotificationTypeEnum } from "src/entities/notification-type.entity";

export interface Message {
  message: string;
  type: NotificationTypeEnum;
}
