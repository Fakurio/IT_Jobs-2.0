import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { StatusEnum } from "../../entities/status.entity";

@Injectable()
export class StatusQueryParamPipe implements PipeTransform {
  transform(queryString: string) {
    if (!queryString) {
      throw new BadRequestException("Status query parameter is required");
    }
    if (!StatusEnum[queryString.toUpperCase()]) {
      throw new BadRequestException(
        "Allowed values for status: accepted, rejected, pending"
      );
    }
    return queryString;
  }
}
