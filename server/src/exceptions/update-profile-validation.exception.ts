import { HttpException, HttpStatus } from "@nestjs/common";

export class UpdateProfileValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
