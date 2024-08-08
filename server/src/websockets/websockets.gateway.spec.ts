import { Test, TestingModule } from "@nestjs/testing";
import { WebSocketsGateway } from "./websockets.gateway";
import { WebSocketsService } from "./websockets.service";

describe("WebSocketsGateway", () => {
  let gateway: WebSocketsGateway;
  let notificationsServiceMock = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketsGateway,
        { provide: WebSocketsService, useValue: notificationsServiceMock },
      ],
    }).compile();

    gateway = module.get<WebSocketsGateway>(WebSocketsGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
