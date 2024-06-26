import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterRequestDto } from '../auth/dto/register-request.dto';
import { Role, RoleTypes } from '../entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async addUser(registerRequestDTO: RegisterRequestDto): Promise<User> {
    const newUser = new User();
    newUser.email = registerRequestDTO.email;
    newUser.password = registerRequestDTO.password;
    newUser.username = registerRequestDTO.username;
    newUser.roles = await this.rolesRepository.findBy({
      role: RoleTypes.USER,
    });
    return await this.usersRepository.save(newUser);
  }
}
