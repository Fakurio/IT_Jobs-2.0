import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  StreamableFile,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { RegisterRequestDto } from "../auth/dto/register-request.dto";
import { Role, RoleTypes } from "../entities/role.entity";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { Request, Response } from "express";
import { HashService } from "../auth/hash/hash.service";
import { createReadStream } from "fs";
import { join } from "path";
import * as process from "node:process";
import { JobPost } from "src/entities/job-post.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private hashService: HashService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ["roles"],
    });
  }

  async checkForUsername(username: string) {
    return await this.usersRepository.exists({ where: { username } });
  }

  async addUser(
    registerRequestDTO: RegisterRequestDto,
    role: RoleTypes
  ): Promise<User> {
    const newUser = new User();
    newUser.email = registerRequestDTO.email;
    newUser.password = registerRequestDTO.password;
    newUser.username = registerRequestDTO.username;
    newUser.roles = await this.rolesRepository.findBy({
      role: role,
    });
    return await this.usersRepository.save(newUser);
  }

  async updateProfile(
    request: Request,
    userDTO: UpdateProfileDTO,
    cv: Express.Multer.File
  ) {
    const { oldPassword, username, newPassword } = userDTO;
    if (!username && !oldPassword && !cv && !newPassword) {
      throw new BadRequestException("No data provided for profile update");
    }
    const authenticatedUser = request.user as User;
    try {
      if (username) {
        await this.updateUsername(authenticatedUser, username);
      }
      if (newPassword && oldPassword) {
        await this.updatePassword(authenticatedUser, oldPassword, newPassword);
      }
      if (cv) {
        await this.updateCV(authenticatedUser, cv);
      }
      return {
        message: "Profile updated successfully",
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      console.log(error);
      throw new InternalServerErrorException("Failed to update profile");
    }
  }

  getAuthenticatedUserCV(request: Request) {
    const authenticatedUser = request.user as User;
    if (!authenticatedUser.cv) {
      throw new BadRequestException("You haven't uploaded CV");
    }
    const cv = createReadStream(
      join(process.cwd(), `cv-files/${authenticatedUser.cv}`)
    );
    return new StreamableFile(cv);
  }

  previewAuthenticatedUserCV(request: Request, response: Response) {
    const authenticatedUser = request.user as User;
    if (!authenticatedUser.cv) {
      throw new BadRequestException("You haven't uploaded CV");
    }
    return response.sendFile(
      join(process.cwd(), `cv-files/${authenticatedUser.cv}`)
    );
  }

  async addPostToFavourites(authenticatedUser: User, post: JobPost) {
    const userWithFavourites = await this.usersRepository.findOne({
      relations: ["favouritePosts"],
      where: { id: authenticatedUser.id },
    });
    userWithFavourites!.favouritePosts.push(post);
    return await this.usersRepository.save(userWithFavourites!);
  }

  async getFavouritePosts(authenticatedUser: User) {
    const userWithFavourites = await this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.favouritePosts", "favouritePosts")
      .innerJoinAndSelect("favouritePosts.level", "level")
      .innerJoinAndSelect("favouritePosts.contractType", "contractType")
      .innerJoinAndSelect("favouritePosts.languages", "languages")
      .innerJoin("favouritePosts.author", "author")
      .addSelect(["author.id", "author.username"])
      .where("user.id = :id", { id: authenticatedUser.id })
      .getOne();
    if (!userWithFavourites) {
      return [];
    }
    return userWithFavourites.favouritePosts;
  }

  async deletePostFromFavourite(postID: number, authenticatedUser: User) {
    const userWithFavourites = await this.usersRepository.findOne({
      relations: ["favouritePosts"],
      where: { id: authenticatedUser.id },
    });
    const preDeleteLenght = userWithFavourites!.favouritePosts.length;
    userWithFavourites!.favouritePosts =
      userWithFavourites!.favouritePosts.filter((post) => post.id !== postID);
    if (preDeleteLenght === userWithFavourites!.favouritePosts.length) {
      throw new BadRequestException("Post not found in favourites");
    }
    return await this.usersRepository.save(userWithFavourites!);
  }

  private async updateUsername(authenticatedUser: User, username: string) {
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      {
        username: username,
      }
    );
  }

  private async updatePassword(
    authenticatedUser: User,
    oldPassword: string,
    newPassword: string
  ) {
    const passwordCheck = await this.hashService.verifyPassword(
      oldPassword,
      authenticatedUser.password
    );
    if (!passwordCheck) {
      throw new BadRequestException("Invalid old password");
    }
    const passwordHash = await this.hashService.hashPassword(newPassword);
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      { password: passwordHash }
    );
  }

  private async updateCV(authenticatedUser: User, cv: Express.Multer.File) {
    const { filename } = cv;
    await this.usersRepository.update(
      { email: authenticatedUser.email },
      {
        cv: filename,
      }
    );
  }
}
