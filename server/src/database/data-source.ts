import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { Role } from '../entities/role.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Session, Role],
  synchronize: true,
};
