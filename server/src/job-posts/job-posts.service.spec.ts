import { Test, TestingModule } from "@nestjs/testing";
import { JobPostsService } from "./job-posts.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JobPost } from "../entities/job-post.entity";
import {
  ContractType,
  ContractTypeEnum,
} from "../entities/contract-type.entity";
import { Level, LevelEnum } from "../entities/level.entity";
import { Status, StatusEnum } from "../entities/status.entity";
import { Language, LanguageEnum } from "../entities/language.entity";
import { In, Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { User } from "../entities/user.entity";

describe("JobPostsService", () => {
  let service: JobPostsService;
  let jobPostsRepository: Repository<JobPost>;
  let contractTypesRepository: Repository<ContractType>;
  let levelsRepository: Repository<Level>;
  let statusRepository: Repository<Status>;
  let languagesRepository: Repository<Language>;

  const jobPostMock = {
    id: 1,
    title: "Test Job Post",
    companyName: "Pollub",
    salary: 2000,
    logo: "logo.png",
    description: "Lorem ipsum...",
    location: "Lublin",
    level: { id: 1, name: "Junior" },
    contractType: { id: 1, name: "B2B" },
    author: { id: 1, username: "Kamil" },
    languages: [{ id: 1, name: "JavaScript" }],
  };
  const jobPosts = [
    {
      id: 1,
      title: "Test1",
      status: StatusEnum.ACCEPTED,
      author: { id: 1, username: "Kamil" },
    },
    {
      id: 2,
      title: "Test2",
      status: StatusEnum.ACCEPTED,
      author: { id: 1, username: "Kamil" },
    },
    {
      id: 3,
      title: "Do weryfikacji",
      status: StatusEnum.PENDING,
      author: { id: 2, username: "Romek" },
    },
  ];
  const jobPostRepositoryMock = {
    createQueryBuilder: jest.fn(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn((field: string, condition) => {
          if (condition.status) {
            return {
              getMany: jest.fn(() =>
                Promise.resolve(
                  jobPosts.filter((post) => post.status === condition.status)
                )
              ),
            };
          }
          if (condition.id) {
            if (field.startsWith("author.id")) {
              return {
                getMany: jest.fn(() =>
                  Promise.resolve(
                    jobPosts.filter((post) => post.author.id === condition.id)
                  )
                ),
              };
            }
            return {
              andWhere: jest.fn(() => {
                return {
                  getOneOrFail: jest.fn(() => {
                    const post = jobPosts.filter(
                      (post) =>
                        post.id === condition.id &&
                        post.status === StatusEnum.PENDING
                    )[0];
                    if (!post) {
                      throw new Error();
                    }
                    return Promise.resolve(post);
                  }),
                };
              }),
            };
          }
          return jest.fn().mockReturnThis();
        }),
      };
    }),
    save: jest.fn((post) => Promise.resolve({ ...post, id: 1 })),
    findOne: jest.fn((condition) => {
      return Promise.resolve(
        jobPosts.filter((post) => post.author.id === condition.where.id)[0]
      );
    }),
  };
  const contractTypesRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve([])),
  };
  const levelsRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve([])),
  };
  const statusRepositoryMock = {
    findOneBy: jest.fn(() => Promise.resolve(StatusEnum.ACCEPTED)),
  };
  const languagesRepositoryMock = {
    findBy: jest.fn(() => Promise.resolve([])),
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
      ],
    }).compile();

    service = module.get<JobPostsService>(JobPostsService);
    jobPostsRepository = module.get<Repository<JobPost>>(
      getRepositoryToken(JobPost)
    );
    contractTypesRepository = module.get<Repository<ContractType>>(
      getRepositoryToken(ContractType)
    );
    levelsRepository = module.get<Repository<Level>>(getRepositoryToken(Level));
    statusRepository = module.get<Repository<Status>>(
      getRepositoryToken(Status)
    );
    languagesRepository = module.get<Repository<Language>>(
      getRepositoryToken(Language)
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return list of job posts", async () => {
    expect(await service.getAll()).toEqual(
      jobPosts.filter((post) => post.status === StatusEnum.ACCEPTED)
    );
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should add job post", async () => {
    const authenticatedUser = {
      id: 1,
      username: "Kamil",
      email: "kamil@admin.pl",
      password: "123456",
      cv: "cv.pdf",
      roles: [],
      jobPosts: [],
    };
    const dto = {
      title: jobPostMock.title,
      companyName: jobPostMock.companyName,
      salary: jobPostMock.salary,
      description: jobPostMock.description,
      location: jobPostMock.location,
      level: LevelEnum.JUNIOR,
      contractType: ContractTypeEnum.B2B,
      languages: [LanguageEnum.JAVASCRIPT, LanguageEnum.C],
    };
    const logo = {
      filename: "logo.png",
    } as Express.Multer.File;
    expect(await service.addPost(authenticatedUser, dto, logo)).toEqual({
      message:
        "After moderator approval, your job post will be visible to everyone",
    });
    expect(contractTypesRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(contractTypesRepository.findOneBy).toHaveBeenCalledWith({
      type: dto.contractType,
    });
    expect(statusRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(statusRepository.findOneBy).toHaveBeenCalledWith({
      status: StatusEnum.PENDING,
    });
    expect(levelsRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(levelsRepository.findOneBy).toHaveBeenCalledWith({
      level: dto.level,
    });
    expect(languagesRepository.findBy).toHaveBeenCalledTimes(1);
    expect(languagesRepository.findBy).toHaveBeenCalledWith({
      language: In(dto.languages),
    });
    expect(jobPostsRepository.save).toHaveBeenCalledWith({
      companyName: dto.companyName,
      title: dto.title,
      salary: dto.salary,
      logo: logo.filename,
      description: dto.description,
      location: dto.location,
      contractType: [],
      level: [],
      languages: [],
      status: StatusEnum.ACCEPTED,
      author: authenticatedUser,
    });
    expect(jobPostsRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should return list of job posts for verification", async () => {
    expect(await service.getPostsForVerification()).toEqual(
      jobPosts.filter((post) => post.status === StatusEnum.PENDING)
    );
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should return job post details", async () => {
    expect(await service.getDetailsForPost(3)).toEqual(jobPosts[2]);
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when job post not found", async () => {
    try {
      expect(await service.getDetailsForPost(1));
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it("should update post status", async () => {
    expect(
      await service.updatePostStatus(3, { status: StatusEnum.ACCEPTED })
    ).toEqual({
      message: "Post status updated",
    });
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(statusRepository.findOneBy).toHaveBeenCalledWith({
      status: StatusEnum.ACCEPTED,
    });
    expect(jobPosts[2].status).toEqual(StatusEnum.ACCEPTED);
  });

  it("should throw an error while updating post status", async () => {
    try {
      await service.updatePostStatus(1, { status: StatusEnum.ACCEPTED });
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual(
        "Post with this ID does not exist or does not require verification"
      );
    }
  });

  it("should return list of job posts for authenticated user", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    expect(await service.getAuthenticatedUserPosts(user)).toEqual([
      jobPosts[0],
      jobPosts[1],
    ]);
  });

  it("should return empty list of job posts for authenticated user", async () => {
    const user = {
      id: 3,
      username: "Wojtek",
    } as User;
    expect(await service.getAuthenticatedUserPosts(user)).toEqual([]);
  });

  it("should update authenticated user job post", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    const dto = {
      companyName: "Test company",
    };
    expect(
      await service.updateAuthenticatedUserPost(1, dto, undefined, user)
    ).toEqual({
      message:
        "After moderator approval, your changes will be visible to everyone",
    });
    expect(jobPostsRepository.save).toHaveBeenCalledWith({
      id: 1,
      location: undefined,
      author: { ...user },
      companyName: dto.companyName,
      languages: undefined,
      level: undefined,
      contractType: undefined,
      title: "Test1",
      status: StatusEnum.ACCEPTED,
      salary: undefined,
      description: undefined,
    });
  });

  it("should throw error while updating post => post doesnt exist", async () => {
    const user = {
      id: 1,
      username: "Kamil",
    } as User;
    const dto = {
      companyName: "Test company",
    };
    try {
      await service.updateAuthenticatedUserPost(6, dto, undefined, user);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("Post with this ID does not exist");
    }
  });
});
