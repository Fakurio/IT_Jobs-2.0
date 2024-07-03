import { Test, TestingModule } from "@nestjs/testing";
import { JobPostsController } from "./job-posts.controller";
import { HashService } from "../auth/hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { JobPostsService } from "./job-posts.service";
import { AddPostDTO } from "./dto/add-post.dto";
import { User } from "../entities/user.entity";

describe("JobPostsController", () => {
  let controller: JobPostsController;
  let jobPostsService: JobPostsService;

  const jobPostsServiceMock = {
    addPost: jest.fn((user, dto, logo) => Promise.resolve(true)),
    getAll: jest.fn(() => Promise.resolve([])),
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
});
