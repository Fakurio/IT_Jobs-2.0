import { Injectable, PipeTransform } from "@nestjs/common";
import { PostValidationException } from "../../exceptions/post-validation.exception";

const ALLOWED_FORMATS = ["image/jpg", "image/png", "image/jpeg", "image/svg"];
const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4MB

@Injectable()
export class UpdateLogoFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file) {
      if (!ALLOWED_FORMATS.includes(file.mimetype)) {
        throw new PostValidationException(
          "Logo file must be in JPG, JPEG, PNG or SVG format"
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new PostValidationException(
          "Logo file size must be less than 4MB"
        );
      }
    }
    return file;
  }
}
