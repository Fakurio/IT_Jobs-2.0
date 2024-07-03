import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { unlinkSync } from "fs";
import { AddPostValidationException } from "../exceptions/add-post-validation.exception";
import { UpdateProfileValidationException } from "../exceptions/update-profile-validation.exception";

@Catch(AddPostValidationException, UpdateProfileValidationException)
export class FileUploadFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    unlinkSync(request.file!.path);

    response.status(status).json({
      message: exception.message,
      error: "Bad Request",
      statusCode: status,
    });
  }
}
