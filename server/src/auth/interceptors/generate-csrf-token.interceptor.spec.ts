import { Test, TestingModule } from "@nestjs/testing";
import { GenerateCsrfTokenInterceptor } from "./generate-csrf-token.interceptor";
import { HashService } from "../hash/hash.service";
import { ConfigService } from "@nestjs/config";

describe("GenerateCsrfTokenInterceptor", () => {
  let interceptor: GenerateCsrfTokenInterceptor;
  let hashService: HashService;

  const hashServiceMock = {
    hashPassword: jest.fn(() => "mockHash"),
  };
  const configServiceMock = {
    get: jest.fn(() => "mockSecret"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateCsrfTokenInterceptor,
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

    interceptor = module.get<GenerateCsrfTokenInterceptor>(
      GenerateCsrfTokenInterceptor,
    );
    hashService = module.get<HashService>(HashService);
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should generate x-csrf-token", async () => {
    let header = "";
    const context = {
      switchToHttp: jest.fn(() => {
        return {
          getRequest: jest.fn(() => {
            return {
              sessionID: "123456",
            };
          }),
          getResponse: jest.fn(() => {
            return {
              setHeader: jest.fn((name, value) => {
                if (name === "x-csrf-token") {
                  header = value;
                }
              }),
            };
          }),
        };
      }),
    };
    const nextHandler = {
      handle: jest.fn(),
    };
    await interceptor.intercept(context as any, nextHandler);
    expect(nextHandler.handle).toHaveBeenCalledTimes(1);
    expect(hashService.hashPassword).toHaveBeenCalledWith("123456mockSecret");
    expect(hashServiceMock.hashPassword).toHaveBeenCalledTimes(1);
    expect(header).toEqual("mockHash");
  });
});
