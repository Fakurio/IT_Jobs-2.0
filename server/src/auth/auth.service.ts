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
import { WebSocketsService } from "../websockets/websockets.service";
import { Session } from "../entities/session.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashService: HashService,
    private webSocketsService: WebSocketsService,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>
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
      user.password
    );

    if (!passwordCheck) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async registerUser(registerRequestDTO: RegisterRequestDto) {
    const userExists = await this.usersService.findByEmail(
      registerRequestDTO.email
    );
    if (userExists) {
      throw new BadRequestException("User already exists");
    }
    const usernameExists = await this.usersService.checkForUsername(
      registerRequestDTO.username
    );
    if (usernameExists) {
      throw new BadRequestException("Username is already taken");
    }

    registerRequestDTO.password = await this.hashService.hashPassword(
      registerRequestDTO.password
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
    const notifications = await this.webSocketsService.getNotificationsForUser(
      req.user.id
    );
    const response = {
      id: req.user.id,
      cv: req.user.cv,
      username: req.user.username,
      message: "Logged in",
      notifications: notifications,
    };
    this.webSocketsService.updateNotificationsReadStatus(notifications);
    return response;
  }

  getAuthenticatedUser(req: Request) {
    const authenticatedUser = req.user as User;
    return {
      id: authenticatedUser.id,
      cv: authenticatedUser.cv,
      username: authenticatedUser.username,
    };
  }

  async getSessionExpiryTimeForUser(userID: number) {
    const user = (await this.usersService.findByID(userID)) as User;
    const session = await this.sessionsRepository
      .createQueryBuilder("session")
      .select("session.expiredAt")
      .where("JSON_EXTRACT(session.json, '$.passport.user') = :email", {
        email: user.email,
      })
      .andWhere("session.destroyedAt IS NULL")
      .andWhere("FROM_UNIXTIME(session.expiredAt / 1000) > NOW()")
      .getOneOrFail();
    return session.expiredAt;
  }

  async logout(request: Request, response: Response) {
    const authenticatedUser = request.user as User;
    response.clearCookie("connect.sid", { sameSite: "lax" });
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
    this.webSocketsService.removeUser(authenticatedUser.id);
    return {
      logout: true,
    };
  }
}
