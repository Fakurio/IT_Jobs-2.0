import { Injectable } from "@nestjs/common";
import { Seeder } from "nestjs-seeder";
import { Repository } from "typeorm";
import { RoleTypes } from "../entities/role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { HashService } from "src/auth/hash/hash.service";

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private hashService: HashService
  ) {}

  async seed(): Promise<any> {
    const tableContent = await this.usersRepository.find({});
    if (tableContent.length === 0) {
      const dto = {
        username: "Fakurio",
        email: "kamil@admin.pl",
        password: await this.hashService.hashPassword("123456"),
      };
      await this.usersService.addUser(dto, RoleTypes.USER);
    }
  }

  async drop(): Promise<any> {}
}
