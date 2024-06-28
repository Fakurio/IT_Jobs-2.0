import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { RegisterRequestDto } from "../auth/dto/register-request.dto";
import { Role, RoleTypes } from "../entities/role.entity";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { Request } from "express";
import { HashService } from "../auth/hash/hash.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private hashService: HashService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ["roles"],
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

  async updateProfile(
    request: Request,
    userDTO: UpdateProfileDTO,
    cv: Express.Multer.File,
  ) {
    const { password, username } = userDTO;
    const authenticatedUser = request.user as User;
    try {
      if (username) {
        await this.updateUsername(authenticatedUser, username);
      }
      if (password) {
        await this.updatePassword(authenticatedUser, password);
      }
      if (cv) {
        await this.updateCV(authenticatedUser, cv);
      }
      return {
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Failed to update profile");
    }
  }

  private async updateUsername(authenticatedUser: User, username: string) {
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      {
        username: username,
      },
    );
  }

  private async updatePassword(authenticatedUser: User, password: string) {
    const passwordHash = await this.hashService.hashPassword(password);
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      { password: passwordHash },
    );
  }

  private async updateCV(authenticatedUser: User, cv: Express.Multer.File) {
    const { filename } = cv;
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      {
        cv: filename,
      },
    );
  }
}
