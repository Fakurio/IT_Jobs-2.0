import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { RegisterRequestDto } from "../auth/dto/register-request.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email: email });
  }

  async addUser(registerRequestDTO: RegisterRequestDto): Promise<User> {
    const newUser = new User()
    newUser.email = registerRequestDTO.email
    newUser.password = registerRequestDTO.password
    newUser.username = registerRequestDTO.username
    return await this.usersRepository.save(newUser)
  }
}
