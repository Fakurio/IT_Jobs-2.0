import { IsSessionValidGuard } from "./is-session-valid.guard";
import { TestingModule, Test } from "@nestjs/testing";
import { AuthService } from "../../auth/auth.service";
import { WsException } from "@nestjs/websockets";

describe("IsSessionValidGuard", () => {
  let guard: IsSessionValidGuard;

  let authServiceMock = {
    getSessionExpiryTimeForUser: jest.fn((id) => {
      const session = sessions.find((session) => session.id === id);
      return session.expiry;
    }),
  };
  let sessions: any[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsSessionValidGuard,
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    guard = module.get<IsSessionValidGuard>(IsSessionValidGuard);
    sessions = [];
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should return true if session is valid", async () => {
    sessions.push({ id: 1, expiry: new Date().getTime() + 1000 });
    const context = {
      switchToWs: () => ({
        getData: () => ({ sender: { id: 1 } }),
      }),
    };
    expect(await guard.canActivate(context as any)).toEqual(true);
  });

  it("should throw an exception if session is expired", async () => {
    sessions.push({ id: 1, expiry: new Date().getTime() - 1000 });
    const context = {
      switchToWs: () => ({
        getData: () => ({ sender: { id: 1 } }),
      }),
    };
    try {
      await guard.canActivate(context as any);
    } catch (error) {
      expect(error).toBeInstanceOf(WsException);
    }
  });

  it("should throw an exception if session is not found", async () => {
    const context = {
      switchToWs: () => ({
        getData: () => ({ sender: { id: 1 } }),
      }),
    };
    try {
      await guard.canActivate(context as any);
    } catch (error) {
      expect(error).toBeInstanceOf(WsException);
    }
  });
});
