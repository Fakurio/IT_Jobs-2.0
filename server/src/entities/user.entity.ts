import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30 })
  username: string;

  @Column('varchar', { length: 30, unique: true })
  email: string;

  @Column('varchar', { length: 256 })
  password: string;

  @Column('varchar', { length: 30, nullable: true })
  cv: string;
}