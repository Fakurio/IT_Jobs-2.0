import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 500 })
  content!: string;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender!: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  receiver!: User;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt!: Date;
}
