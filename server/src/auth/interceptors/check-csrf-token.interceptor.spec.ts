import { Test, TestingModule } from "@nestjs/testing";
import { HashService } from "../hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { CheckCsrfTokenInterceptor } from "./check-csrf-token.interceptor";
import { UnauthorizedException } from "@nestjs/common";

describe("GenerateCsrfTokenInterceptor", () => {
  let interceptor: CheckCsrfTokenInterceptor;
  let hashService: HashService;

  const hashServiceMock = {
    verifyPassword: jest.fn((payload, hash) =>
      Promise.resolve(payload === hash),
    ),
  };
  const configServiceMock = {
    get: jest.fn(() => "mockSecret"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckCsrfTokenInterceptor,
        {
          provide: HashService,
          useValue: hashServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    interceptor = module.get<CheckCsrfTokenInterceptor>(
      CheckCsrfTokenInterceptor,
    );
    hashService = module.get<HashService>(HashService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should check for x-csrf-token and call next handler", async () => {
    const context = {
      switchToHttp: jest.fn(() => {
        return {
          getRequest: jest.fn(() => {
            return {
              headers: {
                "x-csrf-token": "123456mockSecret",
              },
              sessionID: "123456",
            };
          }),
        };
      }),
    };
    const nextHandler = {
      handle: jest.fn(),
    };
    await interceptor.intercept(context as any, nextHandler);
    expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
    expect(nextHandler.handle).toHaveBeenCalledTimes(1);
  });

  it("should throw error when token is missing", async () => {
    const context = {
      switchToHttp: jest.fn(() => {
        return {
          getRequest: jest.fn(() => {
            return {
              headers: {
                "x-csrf-token": "",
              },
              sessionID: "123456",
            };
          }),
        };
      }),
    };
    const nextHandler = {
      handle: jest.fn(),
    };
    try {
      await interceptor.intercept(context as any, nextHandler);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it("should throw error when token is not valid", async () => {
    const context = {
      switchToHttp: jest.fn(() => {
        return {
          getRequest: jest.fn(() => {
            return {
              headers: {
                "x-csrf-token": "bad token",
              },
              sessionID: "123456",
            };
          }),
        };
      }),
    };
    const nextHandler = {
      handle: jest.fn(),
    };
    try {
      await interceptor.intercept(context as any, nextHandler);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(hashService.verifyPassword).toHaveBeenCalledTimes(1);
    }
  });
});
