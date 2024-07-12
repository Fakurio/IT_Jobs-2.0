import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role, RoleTypes } from "../entities/role.entity";
import { User } from "../entities/user.entity";
import { Repository, createQueryBuilder } from "typeorm";
import { HashService } from "../auth/hash/hash.service";
import { BadRequestException, StreamableFile } from "@nestjs/common";
import * as fs from "node:fs";
import * as process from "node:process";
import { join } from "path";
import { response } from "express";
import { JobPost } from "src/entities/job-post.entity";

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let hashService: HashService;

  let users: any[];
  let usersRepositoryMock = {
    save: jest.fn((user) => {
      if (user.favouritePosts) {
        users[0] = user;
        return;
      }
      return Promise.resolve({ id: 1, ...user });
    }),
    findOne: jest.fn((condition) => {
      if (condition.where.email) {
        return Promise.resolve({
          id: 1,
          email: "kamil@gmail.com",
          password: "12345678",
          username: "Kamil",
          roles: [],
        });
      }
      if (condition.where.id) {
        return Promise.resolve(
          users.filter((user) => user.id === condition.where.id)[0]
        );
      }
    }),
    update: jest.fn((user, value) => Promise.resolve({ ...user, value })),
    createQueryBuilder: jest.fn(() => {
      return {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn((_, condition) => {
          return {
            getOne: jest.fn(() => {
              return Promise.resolve(
                users.filter((user) => user.id === condition.id)[0]
              );
            }),
          };
        }),
      };
    }),
  };
  let rolesRepositoryMock = {
    findBy: jest.fn(() => Promise.resolve([])),
  };
  let hashServiceMock = {
    hashPassword: jest.fn((password) => Promise.resolve(password)),
    verifyPassword: jest.fn((password, hash) =>
      Promise.resolve(password === hash)
    ),
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
    users = [
      {
        id: 1,
        username: "Kamil",
        favouritePosts: [
          { id: 1, title: "Junior Java" },
          { id: 2, title: "Mid Java" },
        ],
      },
    ];
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
    const role = RoleTypes.USER;
    expect(await service.addUser(user, role)).toEqual({
      id: 1,
      ...user,
      roles: [],
    });
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
      { username: "Fakurio" }
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
      oldPassword: "12345678",
      newPassword: "mocne_hasło",
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
      { password: "mocne_hasło" }
    );
    expect(hashService.verifyPassword).toHaveBeenCalledWith(
      "12345678",
      "12345678"
    );
    expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
    expect(hashService.hashPassword).toHaveBeenCalledWith("mocne_hasło");
    expect(hashService.hashPassword).toHaveBeenCalledTimes(1);
  });

  it("should fail updating user's password -> oldPassword is invalid", async () => {
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
      oldPassword: "987877333",
      newPassword: "mocne_hasło",
    };
    const cv = undefined as unknown as Express.Multer.File;
    try {
      await service.updateProfile(requestMock, userDTOMock, cv);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("Invalid old password");
      expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
      expect(hashService.verifyPassword).toHaveBeenCalledWith(
        "987877333",
        "12345678"
      );
    }
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
      { cv: "moje-cv.pdf" }
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
      oldPassword: undefined,
      newPassword: undefined,
    };
    const cv = undefined as unknown as Express.Multer.File;
    try {
      await service.updateProfile(requestMock, userDTOMock, cv);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("No data provided for profile update");
    }
  });

  it("should throw error -> cv not uploaded", () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
        cv: null,
      },
    } as any;
    try {
      service.getAuthenticatedUserCV(requestMock);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("You haven't uploaded CV");
    }
  });

  it("should download user's cv", () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
        cv: "cv.pdf",
      },
    } as any;
    const createReadStreamMock = jest.fn((path, options) => true);
    jest
      .spyOn(fs, "createReadStream")
      .mockImplementationOnce(createReadStreamMock as any);
    expect(service.getAuthenticatedUserCV(requestMock)).toBeInstanceOf(
      StreamableFile
    );
    expect(fs.createReadStream).toHaveBeenCalledTimes(1);
    expect(fs.createReadStream).toHaveBeenCalledWith(
      join(process.cwd(), `cv-files/${requestMock.user.cv}`)
    );
  });

  it("should preview user's cv", () => {
    const requestMock = {
      user: {
        id: 1,
        email: "kamil@admin.pl",
        username: "Kamil",
        password: "12345678",
        roles: [],
        cv: "cv.pdf",
      },
    } as any;
    const responseMock = {
      sendFile: jest.fn((path) => Promise.resolve(true)),
    } as any;
    service.previewAuthenticatedUserCV(requestMock, responseMock);
    expect(responseMock.sendFile).toHaveBeenCalledTimes(1);
    expect(responseMock.sendFile).toHaveBeenCalledWith(
      join(process.cwd(), `cv-files/${requestMock.user.cv}`)
    );
  });

  it("should add post to user's favourite posts", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    const post = {
      id: 3,
      title: "New post",
    } as JobPost;
    await service.addPostToFavourites(user, post);
    expect(users).toEqual([
      {
        ...user,
        favouritePosts: [
          { id: 1, title: "Junior Java" },
          { id: 2, title: "Mid Java" },
          post,
        ],
      },
    ]);
  });

  it("should return authenticated user's favourite posts", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    expect(await service.getFavouritePosts(user)).toEqual([
      { id: 1, title: "Junior Java" },
      { id: 2, title: "Mid Java" },
    ]);
  });

  it("should return empty array -> user has no favourite posts", async () => {
    const user = {
      id: 2,
      username: "Fakurio",
    } as User;
    expect(await service.getFavouritePosts(user)).toEqual([]);
  });

  it("should delete post from user's favourite posts", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    await service.deletePostFromFavourite(1, user);
    expect(users).toEqual([
      {
        id: 1,
        username: "Kamil",
        favouritePosts: [{ id: 2, title: "Mid Java" }],
      },
    ]);
  });

  it("should throw error -> post not found in favourites", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    try {
      await service.deletePostFromFavourite(5, user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("Post not found in favourites");
    }
  });
});
