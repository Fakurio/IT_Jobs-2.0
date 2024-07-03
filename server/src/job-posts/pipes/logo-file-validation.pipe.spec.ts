import { Test, TestingModule } from "@nestjs/testing";
import { LogoFileValidationPipe } from "./logo-file-validation.pipe";
import { BadRequestException } from "@nestjs/common";

describe("LogoFileValidationPipe", () => {
  let pipe: LogoFileValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogoFileValidationPipe],
    }).compile();
    pipe = module.get<LogoFileValidationPipe>(LogoFileValidationPipe);
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should return file", () => {
    const file = {
      mimetype: "image/jpg",
    } as Express.Multer.File;
    expect(pipe.transform(file)).toEqual(file);
  });

  it("should throw error when file is not valid", () => {
    const file = {
      mimetype: "application/pdf",
    } as Express.Multer.File;
    try {
      pipe.transform(file);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual(
        "Logo file must be in JPG, JPEG, PNG or SVG format",
      );
    }
  });

  it("should throw error when file is missing", () => {
    const file = undefined as unknown as Express.Multer.File;
    try {
      pipe.transform(file);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("Logo not uploaded");
    }
  });
});
