import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./role.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 30 })
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
}
