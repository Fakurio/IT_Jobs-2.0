import {
  Body,
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Delete,
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
import { Roles } from "../auth/decorators/roles.decorator";
import { RoleTypes } from "../entities/role.entity";
import { RolesGuard } from "../auth/guards/roles.guard";
import UpdatePostStatus, {
  UpdatePostStatusDTO,
} from "./dto/update-post-status.dto";
import UpdatePostSchema, { UpdatePostDTO } from "./dto/update-post.dto";
import { UpdateLogoFileValidationPipe } from "./pipes/update-logo-file-validation.pipe";

@Controller("job-posts")
export class JobPostsController {
  constructor(private jobPostsService: JobPostsService) {}

  @Get("/")
  getAllPosts() {
    return this.jobPostsService.getAll();
  }

  @Get("/levels")
  getLevels() {
    return this.jobPostsService.getLevels();
  }

  @Get("/contract-types")
  getContractTypes() {
    return this.jobPostsService.getContractTypes();
  }

  @Get("/languages")
  getLanguages() {
    return this.jobPostsService.getLanguages();
  }

  @UseFilters(FileUploadFilter)
  @UseInterceptors(FileInterceptor("logo", { storage: LogoDiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Post("/")
  addPost(
    @Body(new ZodValidationPipe(AddPostSchema)) addPostDTO: AddPostDTO,
    @UploadedFile(new LogoFileValidationPipe()) logo: Express.Multer.File,
    @Req() request: Request
  ) {
    const authenticatedUser = request.user as User;
    return this.jobPostsService.addPost(authenticatedUser, addPostDTO, logo);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleTypes.MODERATOR)
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/pending")
  getPostsForVerification() {
    return this.jobPostsService.getPostsForVerification();
  }

  @UseGuards(RolesGuard)
  @Roles(RoleTypes.MODERATOR)
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/pending/:id")
  getDetailsForPost(@Param("id", ParseIntPipe) postID: number) {
    return this.jobPostsService.getDetailsForPost(postID);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleTypes.MODERATOR)
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Put("/pending/:id/status")
  updatePostStatus(
    @Param("id", ParseIntPipe) postID: number,
    @Body(new ZodValidationPipe(UpdatePostStatus))
    updatePostStatuDTO: UpdatePostStatusDTO
  ) {
    return this.jobPostsService.updatePostStatus(postID, updatePostStatuDTO);
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/me")
  getAuthenticatedUserPosts(@Req() request: Request) {
    const authenticatedUser = request.user as User;
    return this.jobPostsService.getAuthenticatedUserPosts(authenticatedUser);
  }

  @UseFilters(FileUploadFilter)
  @UseInterceptors(FileInterceptor("logo", { storage: LogoDiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Put("/:id")
  updateAuthenticatedUserPost(
    @Param("id", ParseIntPipe) postID: number,
    @Body(new ZodValidationPipe(UpdatePostSchema)) updatePostDTO: UpdatePostDTO,
    @Req() request: Request,
    @UploadedFile(new UpdateLogoFileValidationPipe()) logo: Express.Multer.File
  ) {
    const authenticatedUser = request.user as User;
    return this.jobPostsService.updateAuthenticatedUserPost(
      postID,
      updatePostDTO,
      logo,
      authenticatedUser
    );
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Delete("/:id")
  deleteAuthenticatedUserPost(
    @Param("id", ParseIntPipe) postID: number,
    @Req() request: Request
  ) {
    const authenticatedUser = request.user as User;
    return this.jobPostsService.deleteAuthenticatedUserPost(
      postID,
      authenticatedUser
    );
  }
}
