import { Injectable, PipeTransform } from "@nestjs/common";
import { UpdateProfileValidationException } from "../../exceptions/update-profile-validation.exception";

@Injectable()
export class CVFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file && file.mimetype !== "application/pdf") {
      throw new UpdateProfileValidationException(
        "CV file must be in PDF format"
      );
    }
    return file;
  }
}
