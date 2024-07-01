import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { HashService } from "./hash/hash.service";
import { User } from "src/entities/user.entity";
import LoginRequestSchema, { LoginRequestDto } from "./dto/login-request.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { Request, Response } from "express";
import { RoleTypes } from "../entities/role.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashService: HashService,
  ) {}

  async validateUser(loginRequestDTO: LoginRequestDto): Promise<User> {
    if (!LoginRequestSchema.safeParse(loginRequestDTO).success) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { email, password } = loginRequestDTO;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("User does not exist");
    }

    const passwordCheck = await this.hashService.verifyPassword(
      password,
      user.password,
    );

    if (!passwordCheck) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async registerUser(registerRequestDTO: RegisterRequestDto) {
    const userExists = await this.usersService.findByEmail(
      registerRequestDTO.email,
    );
    if (userExists) {
      throw new BadRequestException("User already exists");
    }

    registerRequestDTO.password = await this.hashService.hashPassword(
      registerRequestDTO.password,
    );
    try {
      await this.usersService.addUser(registerRequestDTO, RoleTypes.USER);
      return {
        message: "User registered successfully",
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException("Failed to register user");
    }
  }

  async login(req: any) {
    return {
      cv: req.user.cv,
      username: req.user.username,
      message: "Logged in",
    };
  }

  async logout(request: Request, response: Response) {
    response.clearCookie("connect.sid", { sameSite: "strict" });
    const logoutError = await new Promise((resolve) => {
      request.logOut((error) => resolve(error));
    });
    const sessionError = await new Promise((resolve) => {
      request.session.destroy((error) => resolve(error));
    });

    if (logoutError || sessionError) {
      console.error(logoutError, sessionError);
      throw new InternalServerErrorException("Could not log out user");
    }

    return {
      logout: true,
    };
  }
}
