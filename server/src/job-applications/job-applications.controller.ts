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
} from "@nestjs/common";
import { JobApplicationsService } from "./job-applications.service";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { CVDiskStorage } from "../users/multer-cv-storage/cv-disk-storage";
import { CVFileValidationPipe } from "../users/pipes/cv-file-validation.pipe";
import { FileUploadFilter } from "../filters/file-upload.filter";
import { Request } from "express";

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
}
