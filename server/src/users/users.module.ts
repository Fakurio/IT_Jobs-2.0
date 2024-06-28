import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { UsersController } from "./users.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
