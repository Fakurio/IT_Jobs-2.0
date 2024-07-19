import { User } from "../entities/user.entity";
import { Session } from "../entities/session.entity";
import { Role } from "../entities/role.entity";
import * as dotenv from "dotenv";
import { ContractType } from "../entities/contract-type.entity";
import { JobPost } from "../entities/job-post.entity";
import { Language } from "../entities/language.entity";
import { Level } from "../entities/level.entity";
import { Status } from "../entities/status.entity";
import { JobApplication } from "src/entities/job-application.entity";

dotenv.config();

export const dataSourceOptions = {
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Session,
    Role,
    ContractType,
    JobPost,
    Language,
    Level,
    Status,
    JobApplication,
  ],
  synchronize: true,
};
