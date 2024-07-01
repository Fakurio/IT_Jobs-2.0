import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import {Repository, Table} from 'typeorm';
import { Role, RoleTypes } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleSeeder implements Seeder {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async seed(): Promise<any> {
    const tableContent = await this.rolesRepository.find({});
    if(tableContent.length === 0) {
      for (const role of Object.values(RoleTypes)) {
        let newRole = new Role();
        newRole.role = role;
        await this.rolesRepository.save(newRole);
      }
    }
  }

  async drop(): Promise<any> {}
}
