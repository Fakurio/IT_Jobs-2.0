import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ContractType } from "./contract-type.entity";
import { Level } from "./level.entity";
import { User } from "./user.entity";
import { Status } from "./status.entity";
import { Language } from "./language.entity";

@Entity()
export class JobPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 45 })
  companyName!: string;

  @Column("varchar", { length: 45 })
  title!: string;

  @Column("int")
  salary!: number;

  @Column("varchar", { length: 20 })
  logo!: string;

  @Column("varchar", { length: 500 })
  description!: string;

  @Column("varchar", { length: 25 })
  location!: string;

  @ManyToOne(() => ContractType, (contractType) => contractType.jobPosts)
  contractType!: ContractType;

  @ManyToOne(() => Level, (level) => level.jobPosts)
  level!: Level;

  @ManyToOne(() => User, (user) => user.jobPosts)
  author!: User;

  @ManyToOne(() => Status, (status) => status.jobPosts)
  status!: Status;

  @ManyToMany(() => Language, (language) => language.jobPosts)
  @JoinTable({ name: "job_posts_languages" })
  languages!: Language[];
}
