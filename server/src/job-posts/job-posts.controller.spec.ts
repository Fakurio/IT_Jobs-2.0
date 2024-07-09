import { Test, TestingModule } from "@nestjs/testing";
import { JobPostsController } from "./job-posts.controller";
import { HashService } from "../auth/hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { JobPostsService } from "./job-posts.service";
import { AddPostDTO } from "./dto/add-post.dto";
import { User } from "../entities/user.entity";
import { StatusEnum } from "../entities/status.entity";

describe("JobPostsController", () => {
  let controller: JobPostsController;
  let jobPostsService: JobPostsService;

  const jobPostsServiceMock = {
    addPost: jest.fn((user, dto, logo) => Promise.resolve(true)),
    getAll: jest.fn(() => Promise.resolve([])),
    getPostsForVerification: jest.fn(() => Promise.resolve([])),
    getDetailsForPost: jest.fn((id) => Promise.resolve({ id: id })),
    updatePostStatus: jest.fn((id, body) =>
      Promise.resolve({ id: id, status: body.status })
    ),
    deleteAuthenticatedUserPost: jest.fn((id, user) => Promise.resolve(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostsController],
      providers: [
        { provide: HashService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: JobPostsService, useValue: jobPostsServiceMock },
      ],
    }).compile();

    controller = module.get<JobPostsController>(JobPostsController);
    jobPostsService = module.get<JobPostsService>(JobPostsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call addPost method from service", async () => {
    const user = {
      username: "Kamil",
    } as User;
    const request = {
      user: user,
    } as any;
    const dto = {} as AddPostDTO;
    const logo = {} as Express.Multer.File;
    expect(await controller.addPost(dto, logo, request)).toEqual(true);
    expect(jobPostsService.addPost).toHaveBeenCalledTimes(1);
    expect(jobPostsService.addPost).toHaveBeenCalledWith(user, dto, logo);
  });

  it("should call getAllPosts method from service", async () => {
    expect(await controller.getAllPosts()).toEqual([]);
    expect(jobPostsService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should call getPostsForVerification method from service", async () => {
    expect(await controller.getPostsForVerification()).toEqual([]);
    expect(jobPostsService.getPostsForVerification).toHaveBeenCalledTimes(1);
  });

  it("should call getDetailsForPost method from service", async () => {
    expect(await controller.getDetailsForPost(1)).toEqual({ id: 1 });
    expect(jobPostsService.getDetailsForPost).toHaveBeenCalledTimes(1);
    expect(jobPostsService.getDetailsForPost).toHaveBeenCalledWith(1);
  });

  it("should call updatePostStatus method from service", async () => {
    const body = {
      status: StatusEnum.ACCEPTED,
    };
    expect(await controller.updatePostStatus(1, body)).toEqual({
      id: 1,
      status: StatusEnum.ACCEPTED,
    });
    expect(jobPostsService.updatePostStatus).toHaveBeenCalledTimes(1);
    expect(jobPostsService.updatePostStatus).toHaveBeenCalledWith(1, body);
  });

  it("should call deleteAuthenticatedUserPost method from service", async () => {
    const user = {
      username: "Kamil",
    } as User;
    const request = {
      user: user,
    } as any;
    expect(await controller.deleteAuthenticatedUserPost(1, request)).toEqual(
      true
    );
    expect(jobPostsService.deleteAuthenticatedUserPost).toHaveBeenCalledTimes(
      1
    );
  });
});
