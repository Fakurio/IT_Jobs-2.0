import { seeder } from 'nestjs-seeder';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleSeeder } from './seeder/role.seeder';
import * as dotenv from 'dotenv';
import { dataSourceOptions } from './database/data-source';

dotenv.config();

seeder({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([Role]),
  ],
}).run([RoleSeeder]);
