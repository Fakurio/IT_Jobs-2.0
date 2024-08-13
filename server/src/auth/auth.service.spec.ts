import { AuthService } from "./auth.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "../users/users.service";
import { HashService } from "./hash/hash.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { WebSocketsService } from "../websockets/websockets.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Session } from "../entities/session.entity";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let hashService: HashService;

  const users = [
    { email: "kamil@gmail.com", password: "vfhx#%g42" },
    { email: "wojtek@gmail.com", password: "vfhx#%g42" },
  ];
  let usersServiceMock = {
    findByEmail: jest.fn((email) => {
      const filteredUsers = users.filter((user) => user.email === email);
      return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }),
    addUser: jest.fn((dto) =>
      users.push({ email: dto.email, password: dto.password })
    ),
    checkForUsername: jest.fn(),
    findByID: jest.fn(() => Promise.resolve({ email: "" })),
  };
  let hashServiceMock = {
    verifyPassword: jest.fn((hash, password) => hash === password),
    hashPassword: jest.fn((password) => password),
  };
  let notificationsServiceMock = {
    removeUser: jest.fn(),
  };
  let sessionsRepositoryMock = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HashService, useValue: hashServiceMock },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        { provide: WebSocketsService, useValue: notificationsServiceMock },
        {
          provide: getRepositoryToken(Session),
          useValue: sessionsRepositoryMock,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    hashService = module.get<HashService>(HashService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  it("should fail LoginRequestSchema validation", async () => {
    const user = {
      email: "kamil@gmail",
      password: "1234",
    };
    try {
      await authService.validateUser(user);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("should fail validation -> user does not exist", async () => {
    const user = {
      email: "roman@gmail.com",
      password: "1234",
    };
    try {
      await authService.validateUser(user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual("User does not exist");
    }
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it("should fail validation -> bad password", async () => {
    const user = {
      email: "kamil@gmail.com",
      password: "gkjgkbn54HH!",
    };
    try {
      await authService.validateUser(user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
    expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
    expect(hashService.verifyPassword).toHaveBeenCalledWith(
      user.password,
      "vfhx#%g42"
    );
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it("should pass validation and return user", async () => {
    const user = {
      email: "kamil@gmail.com",
      password: "vfhx#%g42",
    };
    const validatedUser = await authService.validateUser(user);
    expect(validatedUser).toEqual(user);
    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(hashService.verifyPassword).toHaveBeenCalledWith(
      user.password,
      user.password
    );
    expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
  });

  it("should fail registration -> user already exists", async () => {
    const user = {
      email: "kamil@gmail.com",
      password: "vfhx#%g42",
      username: "Kamil",
    };
    try {
      await authService.registerUser(user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("User already exists");
    }
    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
  });

  it("should register new user and return message", async () => {
    const user = {
      email: "roman@gmail.com",
      password: "vfhx#%g42",
      username: "Roman",
    };
    expect(await authService.registerUser(user)).toEqual({
      message: "User registered successfully",
    });
    expect(users.length).toEqual(3);
    expect(hashService.hashPassword).toHaveBeenCalledWith(user.password);
    expect(hashService.hashPassword).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
  });

  it("should logout user and return message", async () => {
    const requestMock = {
      logOut: jest.fn((callback) => callback(null)),
      session: {
        destroy: jest.fn((callback) => callback(null)),
      },
      user: { id: 1 },
    };
    const responseMock = {
      clearCookie: jest.fn(),
    };
    expect(
      await authService.logout(requestMock as any, responseMock as any)
    ).toEqual({
      logout: true,
    });
    expect(requestMock.logOut).toHaveBeenCalledTimes(1);
    expect(requestMock.session.destroy).toHaveBeenCalledTimes(1);
    expect(responseMock.clearCookie).toHaveBeenCalledTimes(1);
  });

  it("should get session expiry time for user", async () => {
    const user = { id: 1 };
    const session = { expiredAt: new Date() };
    sessionsRepositoryMock.getOneOrFail.mockResolvedValue(session);
    expect(await authService.getSessionExpiryTimeForUser(user.id)).toEqual(
      session.expiredAt
    );
  });
});
