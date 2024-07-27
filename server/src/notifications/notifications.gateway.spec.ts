import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsService } from "./notifications.service";

describe("NotificationsGateway", () => {
  let gateway: NotificationsGateway;
  let notificationsServiceMock = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: NotificationsService, useValue: notificationsServiceMock },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
