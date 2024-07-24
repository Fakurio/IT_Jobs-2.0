import { StatusEnum } from "../../entities/status.entity";
import { z } from "zod";

const UpdateApplicationStatusSchema = z.object({
  status: z
    .string()
    .refine((status) => {
      return (
        StatusEnum[status.toUpperCase()] === StatusEnum.ACCEPTED ||
        StatusEnum[status.toUpperCase()] === StatusEnum.REJECTED
      );
    })
    .transform((status) => StatusEnum[status.toUpperCase()] as StatusEnum),
});

type UpdateApplicationStatusDTO = z.infer<typeof UpdateApplicationStatusSchema>;

export default UpdateApplicationStatusSchema;
export type { UpdateApplicationStatusDTO };
