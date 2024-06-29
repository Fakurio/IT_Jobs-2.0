import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JobPost } from "./job-post.entity";

export enum ContractTypeEnum {
  B2B = "B2B",
  CONTRACT = "Contract of employment",
  MANDATE_CONTRACT = "Mandate contract",
}

@Entity()
export class ContractType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("enum", { enum: ContractTypeEnum })
  type!: ContractTypeEnum;

  @OneToMany(() => JobPost, (jobPost) => jobPost.contractType)
  jobPosts!: JobPost[];
}
