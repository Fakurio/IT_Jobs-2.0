import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import { ZodEffects, ZodObject } from "zod";
import RegisterRequestSchema from "../dto/register-request.dto";
import UpdateProfileSchema from "../../users/dto/update-profile.dto";
import AddPostSchema from "../../job-posts/dto/add-post.dto";
import { AddPostValidationException } from "../../exceptions/add-post-validation.exception";
import { UpdateProfileValidationException } from "../../exceptions/update-profile-validation.exception";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any> | ZodEffects<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (this.schema instanceof ZodEffects) {
        if (
          this.schema.innerType().shape ===
          UpdateProfileSchema.innerType().shape
        ) {
          throw new UpdateProfileValidationException();
        }
      } else {
        if (this.schema.shape === RegisterRequestSchema.shape) {
          throw new BadRequestException("Invalid registration data");
        }
        if (this.schema.shape === AddPostSchema.shape) {
          throw new AddPostValidationException();
        }
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
