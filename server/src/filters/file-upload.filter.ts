import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { existsSync, readdirSync, unlinkSync } from "fs";
import { PostValidationException } from "../exceptions/post-validation.exception";
import { UpdateProfileValidationException } from "../exceptions/update-profile-validation.exception";
import { ApplyForJobException } from "../exceptions/apply-for-job.exception";

@Catch(
  PostValidationException,
  UpdateProfileValidationException,
  ApplyForJobException
)
export class FileUploadFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (request.file) {
      unlinkSync(request.file.path);
    }

    response.status(status).json({
      message: exception.getResponse(),
      error: "Bad Request",
      statusCode: status,
    });
  }
}
