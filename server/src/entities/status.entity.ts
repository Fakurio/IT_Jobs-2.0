import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JobPost } from "./job-post.entity";

export enum StatusEnum {
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
}

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("enum", { enum: StatusEnum })
  status!: StatusEnum;

  @OneToMany(() => JobPost, (jobPost) => jobPost.status)
  jobPosts!: JobPost[];
}
