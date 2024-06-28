import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import { ZodObject } from "zod";
import RegisterRequestSchema from "../dto/register-request.dto";
import UpdateProfileSchema from "../../users/dto/update-profile.dto";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (this.schema.shape === RegisterRequestSchema.shape) {
        throw new BadRequestException("Invalid registration data");
      }
      if (this.schema.shape === UpdateProfileSchema.shape) {
        throw new BadRequestException("Invalid profile data");
      }
      throw new BadRequestException("Validation failed");
    }
  }
}
