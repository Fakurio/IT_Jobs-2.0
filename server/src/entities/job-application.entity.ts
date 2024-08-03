import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "./status.entity";
import { JobPost } from "./job-post.entity";
import { User } from "./user.entity";

@Entity()
export class JobApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Status, (status) => status.jobApplications)
  status!: Status;

  @ManyToOne(() => JobPost, (jobPost) => jobPost.applications, {
    onDelete: "CASCADE",
  })
  jobPost!: JobPost;

  @ManyToOne(() => User, (user) => user.applications)
  user!: User;
}
