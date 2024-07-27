import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Notification } from "./notification.entity";

export enum NotificationTypeEnum {
  STATUS_CHANGE = "Your application's status has changed",
  NEW_APPLICATION = "You have a new application",
  POST_REJECTED = "Your post has been rejected by moderator",
}

@Entity()
export class NotificationType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("enum", { enum: NotificationTypeEnum })
  type!: NotificationTypeEnum;

  @OneToMany(() => Notification, (notification) => notification.type)
  notifications!: Notification[];
}
