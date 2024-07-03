import { Test, TestingModule } from "@nestjs/testing";
import { JobPostsService } from "./job-posts.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JobPost } from "../entities/job-post.entity";
import {
  ContractType,
  ContractTypeEnum,
} from "../entities/contract-type.entity";
import { Level, LevelEnum } from "../entities/level.entity";
import { User } from "../entities/user.entity";
import { Status, StatusEnum } from "../entities/status.entity";
import { Language, LanguageEnum } from "../entities/language.entity";
import { In, Repository } from "typeorm";
import { Role } from "../entities/role.entity";

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
  const jobPostRepositoryMock = {
    createQueryBuilder: jest.fn(() => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(() => Promise.resolve([jobPostMock])),
      };
    }),
    save: jest.fn((post) => Promise.resolve({ ...post, id: 1 })),
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
      getRepositoryToken(JobPost),
    );
    contractTypesRepository = module.get<Repository<ContractType>>(
      getRepositoryToken(ContractType),
    );
    levelsRepository = module.get<Repository<Level>>(getRepositoryToken(Level));
    statusRepository = module.get<Repository<Status>>(
      getRepositoryToken(Status),
    );
    languagesRepository = module.get<Repository<Language>>(
      getRepositoryToken(Language),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return list of job posts", async () => {
    expect(await service.getAll()).toEqual([jobPostMock]);
    expect(jobPostsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it("should add job post to database", async () => {
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
      message: "JobPost added successfully",
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
  });
});
