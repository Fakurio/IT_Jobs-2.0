import { FileValidationPipe } from "./file-validation.pipe";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";

describe("FileValidationPipe", () => {
  let pipe: FileValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileValidationPipe],
    }).compile();
    pipe = module.get<FileValidationPipe>(FileValidationPipe);
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should return valid file", () => {
    const file = {
      mimetype: "application/pdf",
    } as Express.Multer.File;
    expect(pipe.transform(file)).toEqual(file);
  });

  it("should throw error when file is not valid", () => {
    const file = {
      mimetype: "application/json",
    } as Express.Multer.File;
    try {
      pipe.transform(file);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual("CV file must be in PDF format");
    }
  });

  it("should return undefined when file is undefined", () => {
    const file = undefined as unknown as Express.Multer.File;
    expect(pipe.transform(file)).toEqual(undefined);
  });
});
