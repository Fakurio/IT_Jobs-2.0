import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role } from "../entities/role.entity";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { HashService } from "../auth/hash/hash.service";
import UpdateProfileDto, { UpdateProfileDTO } from "./dto/update-profile.dto";
import { BadRequestException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let hashService: HashService;

  let usersRepositoryMock = {
    save: jest.fn((user) => Promise.resolve({ id: 1, ...user })),
    findOne: jest.fn(() =>
      Promise.resolve({
        id: 1,
        email: "kamil@gmail.com",
        password: "12345678",
        username: "Kamil",
        roles: [],
      }),
    ),
    update: jest.fn((user, value) => Promise.resolve({ ...user, value })),
  };
  let rolesRepositoryMock = {
    findBy: jest.fn(() => Promise.resolve([])),
  };
  let hashServiceMock = {
    hashPassword: jest.fn((password) => Promise.resolve(password)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: rolesRepositoryMock,
        },
        {
          provide: HashService,
          useValue: hashServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    hashService = module.get<HashService>(HashService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should add new user", async () => {
    const user = {
      email: "kamil@gmail.com",
      password: "123456",
      username: "Kamil",
    };
    expect(await service.addUser(user)).toEqual({ id: 1, ...user, roles: [] });
    expect(usersRepository.save).toHaveBeenLastCalledWith({
      ...user,
      roles: [],
    });
    expect(usersRepository.save).toHaveBeenCalledTimes(1);
    expect(rolesRepository.findBy).toHaveBeenCalledTimes(1);
  });

  it("should find user by email and return it", async () => {
    const email = "kamil@gmail.com";
    const user = {
      id: 1,
      email,
      username: "Kamil",
      password: "12345678",
      roles: [],
    };
    expect(await service.findByEmail(email)).toEqual(user);
    expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
    expect(usersRepository.findOne).toHaveBeenLastCalledWith({
      where: { email },
      relations: ["roles"],
    });
  });

  it("should update user's username", async () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
      },
    } as any;
    const userDTOMock = {
      username: "Fakurio",
    };
    const cv = undefined as unknown as Express.Multer.File;
    expect(await service.updateProfile(requestMock, userDTOMock, cv)).toEqual({
      message: "Profile updated successfully",
    });
    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    expect(usersRepository.update).toHaveBeenCalledWith(
      {
        email: "kamil@admin.pl",
      },
      { username: "Fakurio" },
    );
  });

  it("should update user's password", async () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
      },
    } as any;
    const userDTOMock = {
      password: "mocne_hasło",
    };
    const cv = undefined as unknown as Express.Multer.File;
    expect(await service.updateProfile(requestMock, userDTOMock, cv)).toEqual({
      message: "Profile updated successfully",
    });
    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    expect(usersRepository.update).toHaveBeenCalledWith(
      {
        email: "kamil@admin.pl",
      },
      { password: "mocne_hasło" },
    );
    expect(hashService.hashPassword).toHaveBeenCalledWith("mocne_hasło");
    expect(hashService.hashPassword).toHaveBeenCalledTimes(1);
  });

  it("should update user's cv", async () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
      },
    } as any;
    const userDTOMock = {
      username: undefined,
      password: undefined,
    };
    const cv = {
      filename: "moje-cv.pdf",
    } as Express.Multer.File;
    expect(await service.updateProfile(requestMock, userDTOMock, cv)).toEqual({
      message: "Profile updated successfully",
    });
    expect(usersRepository.update).toHaveBeenCalledTimes(1);
    expect(usersRepository.update).toHaveBeenCalledWith(
      {
        email: "kamil@admin.pl",
      },
      { cv: "moje-cv.pdf" },
    );
  });

  it("should throw error -> no profile data provided", async () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
      },
    } as any;
    const userDTOMock = {
      username: undefined,
      password: undefined,
    };
    const cv = undefined as unknown as Express.Multer.File;
    try {
      await service.updateProfile(requestMock, userDTOMock, cv);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("No data provided for profile update");
    }
  });
});
