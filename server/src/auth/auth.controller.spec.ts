import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { HashService } from "./hash/hash.service";
import { ConfigService } from "@nestjs/config";

describe("AuthController", () => {
  let authService: AuthService;
  let authController: AuthController;

  let authServiceMock = {
    login: jest.fn(() => Promise.resolve(true)),
    registerUser: jest.fn((user) => ({
      message: "User registered successfully",
    })),
    logout: jest.fn(() => Promise.resolve({ logout: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: HashService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authController).toBeDefined();
  });

  it("should call login method from service", async () => {
    const requestMock = {};
    const responseMock = {
      status: jest.fn(),
    };
    expect(
      await authController.login(requestMock as any, responseMock as any),
    ).toEqual(true);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it("should call register method from service", async () => {
    const user = {
      email: "kamil@gmail.com",
      password: "123456",
      username: "Kamil",
    };
    expect(await authController.register(user)).toEqual({
      message: "User registered successfully",
    });
    expect(authService.registerUser).toHaveBeenCalledTimes(1);
    expect(authService.registerUser).toHaveBeenCalledWith(user);
  });

  it("should call logout method from service", async () => {
    const responseMock = {
      status: jest.fn(),
    };
    expect(await authController.logout({} as any, responseMock as any)).toEqual(
      {
        logout: true,
      },
    );
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});
