import { seeder } from "nestjs-seeder";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { RoleSeeder } from "./seeders/role.seeder";
import { dataSourceOptions } from "./database/data-source";
import { ContractType } from "./entities/contract-type.entity";
import { ContractTypeSeeder } from "./seeders/contract-type.seeder";
import { Level } from "./entities/level.entity";
import { LevelSeeder } from "./seeders/level.seeder";
import { Status } from "./entities/status.entity";
import { StatusSeeder } from "./seeders/status.seeder";
import { Language } from "./entities/language.entity";
import { LanguageSeeder } from "./seeders/language.seeder";

seeder({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([Role, ContractType, Level, Status, Language]),
  ],
}).run([
  RoleSeeder,
  ContractTypeSeeder,
  LevelSeeder,
  StatusSeeder,
  LanguageSeeder,
]);
