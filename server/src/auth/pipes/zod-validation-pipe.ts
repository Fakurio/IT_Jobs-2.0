import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import RegisterRequestSchema from '../dto/register-request.dto';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (this.schema === RegisterRequestSchema) {
        throw new BadRequestException('Invalid registration data');
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
