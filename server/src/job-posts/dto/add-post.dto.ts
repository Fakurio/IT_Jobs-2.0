import { z } from "zod";
import { ContractTypeEnum } from "../../entities/contract-type.entity";
import { LevelEnum } from "../../entities/level.entity";
import { LanguageEnum } from "../../entities/language.entity";

const AddPostSchema = z.object({
  companyName: z.string().refine((companyName) => {
    return companyName.trim().length > 0;
  }),
  title: z.string().refine((title) => {
    return title.trim().length > 0;
  }),
  salary: z
    .string()
    .refine((salary) => {
      return salary.trim().length > 0;
    })
    .transform((val) => {
      if (val.includes(".")) {
        throw new Error();
      }
      const parsed = Number.parseInt(val);
      if (isNaN(parsed) || parsed < 2000) {
        throw new Error();
      }
      return parsed;
    }),
  description: z.string().refine((description) => {
    return description.trim().length > 0;
  }),
  location: z.string().refine((location) => {
    return location.trim().length > 0;
  }),
  contractType: z.nativeEnum(ContractTypeEnum),
  level: z.nativeEnum(LevelEnum),
  languages: z.string().transform((val) => {
    const languages = Object.values(LanguageEnum);
    const array = val.split(",");
    let output: LanguageEnum[] = [];
    for (const el of array) {
      // @ts-ignore
      if (!languages.includes(el)) {
        throw new Error();
      }
      output.push(LanguageEnum[el]);
    }
    return output;
  }),
});

type AddPostDTO = z.infer<typeof AddPostSchema>;

export type { AddPostDTO };
export default AddPostSchema;
