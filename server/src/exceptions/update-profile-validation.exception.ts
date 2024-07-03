import { HttpException, HttpStatus } from "@nestjs/common";

export class UpdateProfileValidationException extends HttpException {
  constructor() {
    super("Invalid profile data", HttpStatus.BAD_REQUEST);
  }
}
