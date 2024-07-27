import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./role.entity";
import { JobPost } from "./job-post.entity";
import { JobApplication } from "./job-application.entity";
import { Notification } from "./notification.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 30, unique: true })
  username!: string;

  @Column("varchar", { length: 30, unique: true })
  email!: string;

  @Column("varchar", { length: 256 })
  password!: string;

  @Column("varchar", { length: 30, nullable: true })
  cv!: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: "user_roles" })
  roles!: Role[];

  @OneToMany(() => JobPost, (jobPost) => jobPost.author)
  jobPosts!: JobPost[];

  @ManyToMany(() => JobPost, (jobPost) => jobPost.favouritedBy)
  @JoinTable({ name: "favourite_posts" })
  favouritePosts!: JobPost[];

  @OneToMany(() => JobApplication, (application) => application.user)
  applications!: JobApplication[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications!: Notification[];
}
