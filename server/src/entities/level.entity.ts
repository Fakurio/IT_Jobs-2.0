import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JobPost } from "./job-post.entity";

export enum LevelEnum {
  JUNIOR = "Junior",
  MID = "Mid",
  SENIOR = "Senior",
}

@Entity()
export class Level {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("enum", { enum: LevelEnum })
  level!: LevelEnum;

  @OneToMany(() => JobPost, (jobPost) => jobPost.level)
  jobPosts!: JobPost[];
}
