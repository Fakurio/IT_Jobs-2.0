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
} from "@nestjs/common";
import { JobApplicationsService } from "./job-applications.service";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { CVDiskStorage } from "../users/multer-cv-storage/cv-disk-storage";
import { CVFileValidationPipe } from "../users/pipes/cv-file-validation.pipe";
import { FileUploadFilter } from "../filters/file-upload.filter";
import { Request } from "express";
import { User } from "src/entities/user.entity";

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
}
