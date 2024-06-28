import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role } from "../entities/role.entity";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { HashService } from "../auth/hash/hash.service";

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;

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
  };
  let rolesRepositoryMock = {
    findBy: jest.fn(() => Promise.resolve([])),
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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
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
});
