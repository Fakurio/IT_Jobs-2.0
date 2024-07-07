import { CVFileValidationPipe } from "./cv-file-validation.pipe";
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateProfileValidationException } from "../../exceptions/update-profile-validation.exception";

describe("CVFileValidationPipe", () => {
  let pipe: CVFileValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CVFileValidationPipe],
    }).compile();
    pipe = module.get<CVFileValidationPipe>(CVFileValidationPipe);
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
      expect(error).toBeInstanceOf(UpdateProfileValidationException);
      expect(error.message).toEqual("CV file must be in PDF format");
    }
  });

  it("should return undefined when file is undefined", () => {
    const file = undefined as unknown as Express.Multer.File;
    expect(pipe.transform(file)).toEqual(undefined);
  });
});
