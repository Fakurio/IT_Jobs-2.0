import { Test, TestingModule } from "@nestjs/testing";
import { JobPostsController } from "./job-posts.controller";
import { HashService } from "../auth/hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { JobPostsService } from "./job-posts.service";
import { AddPostDTO } from "./dto/add-post.dto";
import {UpdatePostStatusDTO} from "./dto/update-post-status.dto";

describe("JobPostsController", () => {
  let controller: JobPostsController;
  let jobPostsService: JobPostsService;

  const jobPostsServiceMock = {
    addPost: jest.fn(() => Promise.resolve(true)),
    getAll: jest.fn(() => Promise.resolve([])),
    getPostsForVerification: jest.fn(() => Promise.resolve([])),
    getDetailsForPost: jest.fn((id) => Promise.resolve(1)),
    updatePostStatus: jest.fn(() => Promise.resolve(true)),
    deleteAuthenticatedUserPost: jest.fn(() => Promise.resolve(true)),
    addPostToFavourite: jest.fn(() => Promise.resolve(true)),
    getFavouritePosts: jest.fn(() => Promise.resolve(true)),
    deletePostFromFavourite: jest.fn(() => Promise.resolve(true)),
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

  it("should call addPost method from service", async () => {
    const request = {user: {}} as any;
    const dto = {} as AddPostDTO;
    const logo = {} as Express.Multer.File;
    expect(await controller.addPost(dto, logo, request)).toEqual(true);
    expect(jobPostsService.addPost).toHaveBeenCalledTimes(1);
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
    expect(await controller.getDetailsForPost(1)).toEqual(1);
    expect(jobPostsService.getDetailsForPost).toHaveBeenCalledTimes(1);
  });

  it("should call updatePostStatus method from service", async () => {
    const body = {} as UpdatePostStatusDTO;
    expect(await controller.updatePostStatus(1, body)).toEqual(true);
    expect(jobPostsService.updatePostStatus).toHaveBeenCalledTimes(1);
  });

  it("should call deleteAuthenticatedUserPost method from service", async () => {
    const request = {user: {}} as any;
    expect(await controller.deleteAuthenticatedUserPost(1, request)).toEqual(true);
    expect(jobPostsService.deleteAuthenticatedUserPost).toHaveBeenCalledTimes(1);
  });

  it("should call addPostToFavourite method from service", async () => {
    const request = {user: {}} as any;
    expect(await controller.addPostToFavourite(1, request)).toEqual(true);
    expect(jobPostsService.addPostToFavourite).toHaveBeenCalledTimes(1);
  });

  it("should call getFavouritePosts method from service", async () => {
    const request = {user: {}} as any;
    expect(await controller.getFavouritePosts(request)).toEqual(true);
    expect(jobPostsService.getFavouritePosts).toHaveBeenCalledTimes(1);
  });

  it("should call deletePostFromFavourite method from service", async () => {
    const request = {user: {}} as any;
    expect(await controller.deletePostFromFavourite(1, request)).toEqual(true);
    expect(jobPostsService.deletePostFromFavourite).toHaveBeenCalledTimes(1);
  });
});
