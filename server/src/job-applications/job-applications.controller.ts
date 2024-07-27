import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Get,
  Param,
  Put,
  Query,
} from "@nestjs/common";
import { JobApplicationsService } from "./job-applications.service";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { CVDiskStorage } from "../users/multer-cv-storage/cv-disk-storage";
import { CVFileValidationPipe } from "../users/pipes/cv-file-validation.pipe";
import { FileUploadFilter } from "../filters/file-upload.filter";
import { Request } from "express";
import { User } from "../entities/user.entity";
import UpdateApplicationStatusSchema, {
  UpdateApplicationStatusDTO,
} from "./dto/update-application-status.dto";
import { ZodValidationPipe } from "../auth/pipes/zod-validation.pipe";
import { StatusQueryParamPipe } from "../job-posts/pipes/status-query-param.pipe";

@Controller("job-applications")
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService
  ) {}

  @UseFilters(FileUploadFilter)
  @UseInterceptors(FileInterceptor("cv", { storage: CVDiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Post("/")
  applyForJob(
    @Body("id", ParseIntPipe) postID: number,
    @UploadedFile(new CVFileValidationPipe()) cv: Express.Multer.File,
    @Req() request: Request
  ) {
    return this.jobApplicationsService.applyForJob(request, postID, cv);
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/:id/cv")
  getCVFromApplication(
    @Req() request: Request,
    @Param("id", ParseIntPipe) applicationID: number
  ) {
    const authenticatedUser = request.user as User;
    return this.jobApplicationsService.getCVFromApplication(
      authenticatedUser,
      applicationID
    );
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Put("/:id")
  updateApplicationStatus(
    @Req() request: Request,
    @Param("id", ParseIntPipe) applicationID: number,
    @Body(new ZodValidationPipe(UpdateApplicationStatusSchema))
    updateApplicationStatusDTO: UpdateApplicationStatusDTO
  ) {
    const authenticatedUser = request.user as User;
    return this.jobApplicationsService.updateApplicationStatus(
      authenticatedUser,
      applicationID,
      updateApplicationStatusDTO
    );
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/me")
  getAuthenticatedUserApplications(
    @Req() request: Request,
    @Query("status", StatusQueryParamPipe) statusQueryString: string
  ) {
    const authenticatedUser = request.user as User;
    return this.jobApplicationsService.getAuthenticatedUserApplications(
      authenticatedUser,
      statusQueryString
    );
  }
}
