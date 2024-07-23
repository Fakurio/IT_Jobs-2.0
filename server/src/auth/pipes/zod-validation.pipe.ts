import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import { ZodEffects, ZodSchema } from "zod";
import RegisterRequestSchema from "../dto/register-request.dto";
import AddPostSchema from "../../job-posts/dto/add-post.dto";
import { PostValidationException } from "../../exceptions/post-validation.exception";
import { UpdateProfileValidationException } from "../../exceptions/update-profile-validation.exception";
import UpdatePostStatus from "../../job-posts/dto/update-post-status.dto";
import { StatusEnum } from "../../entities/status.entity";
import UpdatePostSchema from "../../job-posts/dto/update-post.dto";
import UpdateApplicationStatusSchema from "../../job-applications/dto/update-application-status.dto";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      if (this.schema instanceof ZodEffects) {
        // if (this.schema._def.schema === UpdateProfileSchema) {
        throw new UpdateProfileValidationException("Invalid profile data");
        // }
      } else {
        if (this.schema === RegisterRequestSchema) {
          throw new BadRequestException("Invalid registration data");
        }
        if (this.schema === AddPostSchema || this.schema === UpdatePostSchema) {
          throw new PostValidationException("Invalid post data");
        }
        if (this.schema === UpdatePostStatus) {
          throw new BadRequestException(
            `Allowed status values: ${StatusEnum.ACCEPTED}, ${StatusEnum.REJECTED}`
          );
        }
        if (this.schema === UpdateApplicationStatusSchema) {
          throw new BadRequestException(
            `Allowed status values: ${StatusEnum.ACCEPTED}, ${StatusEnum.REJECTED}`
          );
        }
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
