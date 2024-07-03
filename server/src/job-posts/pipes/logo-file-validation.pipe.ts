import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

const ALLOWED_FORMATS = ["image/jpg", "image/png", "image/jpeg", "image/svg"];

@Injectable()
export class LogoFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Logo not uploaded");
    }
    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      throw new BadRequestException(
        "Logo file must be in JPG, JPEG, PNG or SVG format",
      );
    }
    return file;
  }
}
