import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import UpdateProfileSchema, {
  UpdateProfileDTO,
} from "./dto/update-profile.dto";
import { ZodValidationPipe } from "../auth/pipes/zod-validation.pipe";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "./pipes/file-validation.pipe";
import { DiskStorage } from "./multer-storage/disk-storage";
import { IsAuthenticated } from "../auth/guards/is-authenticated";
import { Request } from "express";
import { CheckCsrfTokenInterceptor } from "../auth/interceptors/check-csrf-token.interceptor";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(FileInterceptor("cv", { storage: DiskStorage }))
  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Patch("/")
  updateProfile(
    @Body(new ZodValidationPipe(UpdateProfileSchema)) userDTO: UpdateProfileDTO,
    @UploadedFile(new FileValidationPipe()) cv: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.usersService.updateProfile(request, userDTO, cv);
  }
}
