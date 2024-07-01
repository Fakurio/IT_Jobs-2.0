import { seeder } from "nestjs-seeder";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Role } from "../src/entities/role.entity";
import { RoleSeeder } from "../src/seeders/role.seeder";
import { dataSourceOptions } from "../src/database/data-source";
import { ContractType } from "../src/entities/contract-type.entity";
import { ContractTypeSeeder } from "../src/seeders/contract-type.seeder";
import { Level } from "../src/entities/level.entity";
import { LevelSeeder } from "../src/seeders/level.seeder";
import { Status } from "../src/entities/status.entity";
import { StatusSeeder } from "../src/seeders/status.seeder";
import { Language } from "../src/entities/language.entity";
import { LanguageSeeder } from "../src/seeders/language.seeder";

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
