import { Test, TestingModule } from "@nestjs/testing";
import { JobApplicationsService } from "./job-applications.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JobApplication } from "../entities/job-application.entity";
import { UsersService } from "../users/users.service";
import { JobPostsService } from "../job-posts/job-posts.service";
import { Request } from "express";
import { ApplyForJobException } from "../exceptions/apply-for-job.exception";
import { User } from "src/entities/user.entity";
import * as fs from "node:fs";
import {
  StreamableFile,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

describe("JobApplicationsService", () => {
  let service: JobApplicationsService;
  let usersService: UsersService;

  const jobApplicationsRepositoryMock = {
    save: jest.fn((application) =>
      Promise.resolve(jobApplications.push(application))
    ),
    findOne: jest.fn(({ relations, where }) => {
      return Promise.resolve(
        jobApplications.find((application) => application.id === where.id)
      );
    }),
  };
  const usersServiceMock = {
    updateProfile: jest.fn((request, dto, cv) => Promise.resolve(true)),
  };
  const jobPostsServiceMock = {
    getPostByID: jest.fn((postID) =>
      Promise.resolve(jobPosts.find((post) => post.id === postID))
    ),
    getStatusIDByName: jest.fn(() => Promise.resolve(1)),
    deleteOldCV: jest.fn((user) => Promise.resolve(true)),
  };
  const jobPosts = [
    { id: 1, title: "Test", author: { id: 1 } },
    { id: 2, title: "Test2", author: { id: 1 } },
  ];
  let jobApplications: any[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: getRepositoryToken(JobApplication),
          useValue: jobApplicationsRepositoryMock,
        },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JobPostsService, useValue: jobPostsServiceMock },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
    usersService = module.get<UsersService>(UsersService);
    jobApplications = [];
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should throw error => post not found", async () => {
    const request = {} as Request;
    const postID = 5;
    const cv = null;
    try {
      await service.applyForJob(request, postID, cv);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplyForJobException);
      expect(error.message).toEqual("Post not found");
    }
  });

  it("should throw error => can't apply for own job post", async () => {
    const request = {
      user: { id: 1 },
    } as any;
    const postID = 1;
    const cv = null;
    try {
      await service.applyForJob(request, postID, cv);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApplyForJobException);
      expect(error.message).toEqual("You can't apply for your own job post");
    }
  });

  it("should apply for job (user has cv)", async () => {
    const request = {
      user: { id: 2 },
    } as any;
    const postID = 1;
    const cv = null;
    expect(await service.applyForJob(request, postID, cv)).toEqual({
      message: "Application sent successfully",
    });
    expect(jobApplications).toHaveLength(1);
  });

  it("should apply for job (user doesn't have cv)", async () => {
    const request = {
      user: { id: 2 },
    } as any;
    const postID = 1;
    const cv = {} as Express.Multer.File;
    expect(await service.applyForJob(request, postID, cv)).toEqual({
      message: "Application sent successfully",
    });
    expect(jobApplications).toHaveLength(1);
    expect(usersService.updateProfile).toHaveBeenCalledTimes(1);
  });

  it("should download cv from application", async () => {
    jobApplications.push({
      id: 1,
      user: { cv: "cv.pdf" },
      jobPost: { author: { id: 2 } },
    });
    const user = { id: 2 } as User;
    jest.spyOn(fs, "createReadStream").mockReturnValueOnce(true as any);
    expect(await service.getCVFromApplication(user, 1)).toBeInstanceOf(
      StreamableFile
    );
  });

  it("should throw error while trying to download cv => application not found", async () => {
    const user = { id: 2 } as User;
    try {
      await service.getCVFromApplication(user, 1);
    } catch (error: any) {
      expect(error.message).toEqual("Application not found");
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it("should throw error while trying to download cv => user is not the author of the job post", async () => {
    jobApplications.push({
      id: 1,
      user: { cv: "cv.pdf" },
      jobPost: { author: { id: 1 } },
    });
    const user = { id: 2 } as User;
    try {
      await service.getCVFromApplication(user, 1);
    } catch (error: any) {
      expect(error.message).toEqual("You are not authorized to view this CV");
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it("should throw error while trying to download cv => cv not found", async () => {
    jobApplications.push({
      id: 1,
      user: { cv: null },
      jobPost: { author: { id: 2 } },
    });
    const user = { id: 2 } as User;
    try {
      await service.getCVFromApplication(user, 1);
    } catch (error: any) {
      expect(error.message).toEqual("Applicant has removed their CV");
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
});
