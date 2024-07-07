import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { AddPostValidationException } from "../../exceptions/add-post-validation.exception";

const ALLOWED_FORMATS = ["image/jpg", "image/png", "image/jpeg", "image/svg"];
const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4MB

@Injectable()
export class LogoFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Logo not uploaded");
    }
    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      throw new AddPostValidationException(
        "Logo file must be in JPG, JPEG, PNG or SVG format"
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new AddPostValidationException(
        "Logo file size must be less than 4MB"
      );
    }
    return file;
  }
}
