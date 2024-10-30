import {Test, TestingModule} from "@nestjs/testing";
import {JobPostsService} from "./job-posts.service";
import {getRepositoryToken} from "@nestjs/typeorm";
import {JobPost} from "../entities/job-post.entity";
import {ContractType,} from "../entities/contract-type.entity";
import {Level} from "../entities/level.entity";
import {Status, StatusEnum} from "../entities/status.entity";
import {Language} from "../entities/language.entity";
import {Repository} from "typeorm";
import {BadRequestException} from "@nestjs/common";
import {User} from "../entities/user.entity";
import {UsersService} from "../users/users.service";
import {JobApplicationsService} from "../job-applications/job-applications.service";
import {WebSocketsService} from "../websockets/websockets.service";
import {sampleJobPost} from "./testObjects/jobPostMock";
import {AddPostDTO} from "./dto/add-post.dto";
import {UpdatePostStatusDTO} from "./dto/update-post-status.dto";
import {UpdatePostDTO} from "./dto/update-post.dto";
import * as fs from "node:fs";

describe("JobPostsService", () => {
  let service: JobPostsService;
  let jobPostsRepository: Repository<JobPost>;
  let usersService: UsersService;
  let webSocketsService: WebSocketsService

  let jobPostsMockList: JobPost[];
  const jobPostRepositoryMock = {
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const contractTypesRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve([])),
  };
  const levelsRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve([])),
  };
  const statusRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve([])),
  };
  const languagesRepositoryMock = {
    findBy: jest.fn(() => Promise.resolve([])),
  };
  const usersServiceMock = {
    addPostToFavourites: jest.fn(() => Promise.resolve(true)),
    getFavouritePosts: jest.fn(() => Promise.resolve(true)),
    deletePostFromFavourite: jest.fn(() => Promise.resolve(true)),
  };
  const webSocketsServiceMock = {
    notifyPostAuthor: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostsService,
        {
          provide: getRepositoryToken(JobPost),
          useValue: jobPostRepositoryMock,
        },
        {
          provide: getRepositoryToken(ContractType),
          useValue: contractTypesRepositoryMock,
        },
        { provide: getRepositoryToken(Level), useValue: levelsRepositoryMock },
        { provide: getRepositoryToken(Status), useValue: statusRepositoryMock },
        {
          provide: getRepositoryToken(Language),
          useValue: languagesRepositoryMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JobApplicationsService,
          useValue: {},
        },
        {
          provide: WebSocketsService,
          useValue: webSocketsServiceMock,
        },
      ],
    }).compile();

    service = module.get<JobPostsService>(JobPostsService);
    jobPostsRepository = module.get<Repository<JobPost>>(
      getRepositoryToken(JobPost)
    );
    usersService = module.get<UsersService>(UsersService);
    webSocketsService = module.get<WebSocketsService>(WebSocketsService);
    jobPostsMockList = [sampleJobPost];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return list of job posts", async () => {
    jest.spyOn(jobPostsRepository, "createQueryBuilder").mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue(jobPostsMockList)
      } as any
    })
    expect(await service.getAll()).toEqual(jobPostsMockList);
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should add job post", async () => {
    const authenticatedUser = {} as User;
    const dto = {} as AddPostDTO;
    const logo = {} as Express.Multer.File;
    jest.spyOn(jobPostsRepository, 'save').mockImplementation(() => {
      jobPostsMockList.push(sampleJobPost);
      return Promise.resolve(sampleJobPost);
    })
    expect(await service.addPost(authenticatedUser, dto, logo)).toEqual({
      message:
        "After moderator approval, your job post will be visible to everyone",
    });
    expect(jobPostsMockList).toHaveLength(2);
  });

  it("should return list of job posts for verification", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(() => Promise.resolve(sampleJobPost)),
      } as any
    })
    expect(await service.getPostsForVerification()).toEqual(sampleJobPost);
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should return job post details", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOneOrFail: jest.fn(() => Promise.resolve(sampleJobPost)),
      } as any
    })
    expect(await service.getDetailsForPost(1)).toEqual(sampleJobPost);
  });

  it("should throw error during fetching job post details -> post doesnt exist", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOneOrFail: jest.fn(() => Promise.reject()),
      } as any
    })
    try {
      await service.getDetailsForPost(1)
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("Post with this ID does not exist or does not require verification");
    }
  });

  it("should update post status -> change to accepted", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOneOrFail: jest.fn(() => Promise.resolve(sampleJobPost)),
      } as any
    })
    expect(await service.updatePostStatus(1, {} as UpdatePostStatusDTO)).toEqual({
      message: "Post status updated"
    })
    expect(webSocketsService.notifyPostAuthor).toHaveBeenCalledTimes(0);
  });

  it("should update post status -> change to rejected", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOneOrFail: jest.fn(() => Promise.resolve(sampleJobPost)),
      } as any
    })
    expect(await service.updatePostStatus(1, {status: StatusEnum.REJECTED} as UpdatePostStatusDTO)).toEqual({
      message: "Post status updated"
    })
    expect(webSocketsService.notifyPostAuthor).toHaveBeenCalledTimes(1);
  })

  it("should return list of job posts for authenticated user", async () => {
    jest.spyOn(jobPostsRepository, 'createQueryBuilder').mockImplementation(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(() => Promise.resolve(jobPostsMockList)),
      } as any
    })
    const user = {} as User;
    expect(await service.getAuthenticatedUserPosts(user, "")).toEqual(jobPostsMockList);
  });

  it("should update authenticated user job post", async () => {
    jest.spyOn(jobPostsRepository, "findOne").mockImplementation(() => {
      return Promise.resolve(sampleJobPost);
    })
    jest.spyOn(jobPostsRepository, "save").mockImplementation((post) => {
      jobPostsMockList.push(post as JobPost);
      return Promise.resolve(sampleJobPost);
    })
    const user = {id: 1} as User;
    const dto = {companyName: "Pollub"} as UpdatePostDTO;
    expect(
      await service.updateAuthenticatedUserPost(1, dto, undefined, user)
    ).toEqual({
      message:
        "After moderator approval, your changes will be visible to everyone",
    });
    expect(jobPostsMockList[1].companyName).toEqual("Pollub");
  });

  it("should throw error while updating post => not an author", async () => {
      jest.spyOn(jobPostsRepository, "findOne").mockImplementation(() => {
        return Promise.resolve(sampleJobPost);
      })
      jest.spyOn(jobPostsRepository, "save").mockImplementation((post) => {
        jobPostsMockList.push(post as JobPost);
        return Promise.resolve(sampleJobPost);
      })
      const user = {id: 2} as User;
      const dto = {} as UpdatePostDTO;
      try {
        await service.updateAuthenticatedUserPost(1, dto, undefined, user)
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual("You are not the author of this post");
      }
  });

  it("should delete authenticated user job post", async () => {
    jest.spyOn(jobPostsRepository, "findOne").mockImplementation(() => {
      return Promise.resolve(sampleJobPost);
    })
    jest.spyOn(jobPostsRepository, "delete").mockImplementation(() => {
      jobPostsMockList = []
      return Promise.resolve({} as any);
    })
    const user = {id: 1} as User;
    jest.spyOn(fs, "unlinkSync").mockReturnValue();
    expect(await service.deleteAuthenticatedUserPost(1, user)).toEqual({
      message: "Post deleted",
    });
    expect(jobPostsMockList).toHaveLength(0);
  });

  it("should throw error while deleting post => you are not an author", async () => {
    jest.spyOn(jobPostsRepository, "findOne").mockImplementation(() => {
      return Promise.resolve(sampleJobPost);
    })
    const user = {id: 2} as User;
    try {
      await service.deleteAuthenticatedUserPost(1, user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("You are not the author of this post");
    }
  });

  it("should add post to authenticated user favourites", async () => {
    jest.spyOn(jobPostsRepository, "findOne").mockImplementation(() => {
      return Promise.resolve(sampleJobPost);
    })
    const user = {} as User;
    expect(await service.addPostToFavourite(1, user)).toEqual({
      message: "Post added to favourites",
    });
    expect(usersService.addPostToFavourites).toHaveBeenCalledWith(user, sampleJobPost);
  });

  it("should get authenticated user favourite posts", async () => {
    const user = {} as User;
    expect(await service.getFavouritePosts(user)).toEqual(true);
    expect(usersService.getFavouritePosts).toHaveBeenCalledTimes(1);
  });

  it("should delete post from authenticated user favourites", async () => {
    const user = {} as User;
    expect(await service.deletePostFromFavourite(1, user)).toEqual({
      message: "Post deleted from favourites",
    });
    expect(usersService.deletePostFromFavourite).toHaveBeenCalledTimes(1);
  });
});
