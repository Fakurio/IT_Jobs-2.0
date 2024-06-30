import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { HashService } from "../auth/hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { User } from "../entities/user.entity";
import { StreamableFile } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  let usersServiceMock = {
    updateProfile: jest.fn(() => Promise.resolve(true)),
    getAuthenticatedUserCV: jest.fn(() => true),
    previewAuthenticatedUserCV: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: HashService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call updateProfile method from service", async () => {
    const requestMock = {} as any;
    const userDTOMock = {} as User;
    const cv = {} as Express.Multer.File;
    expect(
      await controller.updateProfile(userDTOMock, cv, requestMock),
    ).toEqual(true);
    expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
  });

  it("should call getAuthenticatedUserCV from service", () => {
    const requestMock = {} as any;
    expect(controller.downloadAuthenticatedUserCV(requestMock)).toEqual(true);
    expect(usersService.getAuthenticatedUserCV).toHaveBeenCalledTimes(1);
  });

  it("should call previewAuthenticatedUserCV from service", () => {
    const requestMock = {} as any;
    const responseMock = {} as any;
    controller.previewAuthenticatedUserCV(requestMock, responseMock);
    expect(usersService.previewAuthenticatedUserCV).toHaveBeenCalledTimes(1);
  });
});
