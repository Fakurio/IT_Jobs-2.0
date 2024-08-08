import { NotificationTypeEnum } from "src/entities/notification-type.entity";

export interface NotificationMessage {
  message: string;
  type: NotificationTypeEnum;
}
