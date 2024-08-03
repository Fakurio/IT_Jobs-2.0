import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { UsersService } from "../users/users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Notification } from "../entities/notification.entity";
import { NotificationType } from "../entities/notification-type.entity";
import { Socket, Server } from "socket.io";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let usersServiceMock = {
    findByID: jest.fn((id) => Promise.resolve({ id })),
  };
  let notificationsRepositoryMock = {
    save: jest.fn((noti: Notification | Notification[]) => {
      if (noti instanceof Notification) {
        return Promise.resolve(notifications.push(noti));
      } else {
        return Promise.resolve(
          noti.forEach((el) => {
            const found = notifications.findIndex((e) => e.id === el.id);
            notifications[found].read = true;
          })
        );
      }
    }),
    createQueryBuilder: jest.fn(() => {
      return {
        select: jest.fn(() => ({
          innerJoinAndSelect: jest.fn(() => ({
            innerJoin: jest.fn(() => ({
              where: jest.fn(() => ({
                andWhere: jest.fn(() => ({
                  getMany: jest.fn(() => Promise.resolve(notifications)),
                })),
              })),
            })),
          })),
        })),
      };
    }),
  };
  let notificationTypesRepositoryMock = {
    findOne: jest.fn(() => Promise.resolve(1)),
  };
  let notifications: any[];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: getRepositoryToken(Notification),
          useValue: notificationsRepositoryMock,
        },
        {
          provide: getRepositoryToken(NotificationType),
          useValue: notificationTypesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notifications = [];
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should add new user", () => {
    const socket = { id: "1245" } as unknown as Socket;
    service.addNewUser(socket, 1);
    expect(service["connectedUsers"].get(1)).toBe("1245");
  });

  it("should remove user", () => {
    service["connectedUsers"].set(1, "1245");
    service.removeUser(1);
    expect(service["connectedUsers"].get(1)).toBeUndefined();
  });

  it("should notify post author about new application => author is offline", async () => {
    service["connectedUsers"].set(1, "123");
    await service.notifyPostAuthor(3, "title", "username");
    expect(notifications.length).toBe(1);
    expect(notifications[0].receiver).toEqual({ id: 3 });
  });

  it("should notify post author about new application => author is online", () => {
    service["connectedUsers"].set(3, "123");
    const server = {
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
    } as unknown as Server;
    service.setServer(server);
    service.notifyPostAuthor(3, "title", "username");
    expect(notifications.length).toBe(0);
  });

  it("should notify post author about rejected post => author is offline", async () => {
    service["connectedUsers"].set(1, "123");
    await service.notifyPostAuthor(3, "title");
    expect(notifications.length).toBe(1);
    expect(notifications[0].content).toBe(
      "Moderator has rejected your post: title"
    );
  });

  it("should get notifications for user", async () => {
    notifications.push({ id: 1, content: "content" });
    expect(await service.getNotificationsForUser(1)).toEqual([
      {
        id: 1,
        content: "content",
      },
    ]);
  });

  it("should update notification's read status", async () => {
    notifications.push({ id: 1, content: "content", read: false });
    await service.updateNotificationsReadStatus(notifications);
    expect(notifications[0].read).toBe(true);
  });
});
