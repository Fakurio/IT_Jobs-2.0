import { z } from "zod";
import { StatusEnum } from "../../entities/status.entity";

const UpdatePostStatus = z.object({
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

type UpdatePostStatusDTO = z.infer<typeof UpdatePostStatus>;

export default UpdatePostStatus;
export type { UpdatePostStatusDTO };
