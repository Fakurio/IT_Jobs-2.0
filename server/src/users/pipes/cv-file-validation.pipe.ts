import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class CVFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file && file.mimetype !== "application/pdf") {
      throw new BadRequestException("CV file must be in PDF format");
    }
    return file;
  }
}
