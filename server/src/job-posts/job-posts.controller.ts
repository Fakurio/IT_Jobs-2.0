import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JobPostsService } from "./job-posts.service";
import AddPostSchema, { AddPostDTO } from "./dto/add-post.dto";
import { ZodValidationPipe } from "../auth/pipes/zod-validation.pipe";
import { FileInterceptor } from "@nestjs/platform-express";
import { LogoFileValidationPipe } from "./pipes/logo-file-validation.pipe";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { Request } from "express";
import { User } from "../entities/user.entity";
import { LogoDiskStorage } from "./multer-logo-storage/logo-disk-storage";
import { FileUploadFilter } from "../filters/file-upload.filter";

@Controller("job-posts")
export class JobPostsController {
  constructor(private jobPostsService: JobPostsService) {}

  @Get("/")
  getAllPosts() {
    return this.jobPostsService.getAll();
  }

  @UseFilters(FileUploadFilter)
  @UseInterceptors(FileInterceptor("logo", { storage: LogoDiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Post("/")
  addPost(
    @Body(new ZodValidationPipe(AddPostSchema)) addPostDTO: AddPostDTO,
    @UploadedFile(new LogoFileValidationPipe()) logo: Express.Multer.File,
    @Req() request: Request,
  ) {
    const authenticatedUser = request.user as User;
    return this.jobPostsService.addPost(authenticatedUser, addPostDTO, logo);
  }
}
