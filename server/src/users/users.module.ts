import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Role } from '../entities/role.entity';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Role])],
  exports: [UsersService],
})
export class UsersModule {}
