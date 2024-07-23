import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import UpdateProfileSchema, {
  UpdateProfileDTO,
} from "./dto/update-profile.dto";
import { ZodValidationPipe } from "../auth/pipes/zod-validation.pipe";
import { FileInterceptor } from "@nestjs/platform-express";
import { CVFileValidationPipe } from "./pipes/cv-file-validation.pipe";
import { CVDiskStorage } from "./multer-cv-storage/cv-disk-storage";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { Request, Response } from "express";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";
import { join } from "path";
import * as process from "node:process";
import { FileUploadFilter } from "../filters/file-upload.filter";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseFilters(FileUploadFilter)
  @UseInterceptors(FileInterceptor("cv", { storage: CVDiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Patch("/")
  updateProfile(
    @Body(new ZodValidationPipe(UpdateProfileSchema)) userDTO: UpdateProfileDTO,
    @UploadedFile(new CVFileValidationPipe()) cv: Express.Multer.File,
    @Req() request: Request
  ) {
    return this.usersService.updateProfile(request, userDTO, cv);
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/cv")
  downloadAuthenticatedUserCV(@Req() request: Request) {
    return this.usersService.getAuthenticatedUserCV(request);
  }

  @UseGuards(IsAuthenticated)
  @Get("/cv/static")
  previewAuthenticatedUserCV(
    @Req() request: Request,
    @Res() response: Response
  ) {
    return this.usersService.previewAuthenticatedUserCV(request, response);
  }

  // @Delete("/cv")
  // removeAuthenticatedUserCV(@Req() request: Request) {}
}
