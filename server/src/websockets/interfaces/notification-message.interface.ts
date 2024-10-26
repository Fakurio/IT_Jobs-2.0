import { NotificationTypeEnum } from "src/entities/notification-type.entity";

export interface NotificationMessage {
  content: string;
  type: NotificationTypeEnum;
}
