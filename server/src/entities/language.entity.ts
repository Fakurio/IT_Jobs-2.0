import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { JobPost } from "./job-post.entity";

export enum LanguageEnum {
  JAVA = "Java",
  C = "C",
  "C++" = "C++",
  "C#" = "C#",
  JAVASCRIPT = "Javascript",
  PYTHON = "Python",
  PHP = "PHP",
}

@Entity()
export class Language {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("enum", { enum: LanguageEnum })
  language!: LanguageEnum;

  @ManyToMany(() => JobPost, (jobPost) => jobPost.languages)
  jobPosts!: JobPost[];
}
