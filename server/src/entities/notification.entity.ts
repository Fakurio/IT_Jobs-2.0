import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { NotificationType } from "./notification-type.entity";

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 100 })
  content!: string;

  @Column("boolean", { default: false })
  read!: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  receiver!: User;

  @ManyToOne(() => NotificationType, (type) => type.type)
  type!: NotificationType;
}
