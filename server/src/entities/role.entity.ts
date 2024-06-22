import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum RoleTypes {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('enum', { enum: RoleTypes, default: RoleTypes.USER })
  role!: RoleTypes;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}
