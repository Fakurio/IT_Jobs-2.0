import { HttpException, HttpStatus } from "@nestjs/common";

export class AddPostValidationException extends HttpException {
  constructor() {
    super("Invalid job post data", HttpStatus.BAD_REQUEST);
  }
}
