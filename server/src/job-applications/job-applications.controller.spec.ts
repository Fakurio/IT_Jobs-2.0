import { Test, TestingModule } from "@nestjs/testing";
import { JobApplicationsController } from "./job-applications.controller";
import { JobApplicationsService } from "./job-applications.service";
import { HashService } from "../auth/hash/hash.service";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

describe("JobApplicationsController", () => {
  let controller: JobApplicationsController;

  const jobApplicationsServiceMock = {
    applyForJob: jest.fn(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationsController],
      providers: [
        {
          provide: JobApplicationsService,
          useValue: jobApplicationsServiceMock,
        },
        { provide: HashService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<JobApplicationsController>(
      JobApplicationsController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call applyForJob method from service", async () => {
    const postID = 1;
    const cv = {} as Express.Multer.File;
    const request = {} as Request;
    expect(await controller.applyForJob(postID, cv, request)).toEqual(true);
  });
});
