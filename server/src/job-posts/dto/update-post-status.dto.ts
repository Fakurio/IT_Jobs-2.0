import { z } from "zod";
import { StatusEnum } from "../../entities/status.entity";

const UpdatePostStatus = z.object({
  status: z.nativeEnum(StatusEnum),
});

type UpdatePostStatusDTO = z.infer<typeof UpdatePostStatus>;

export default UpdatePostStatus;
export type { UpdatePostStatusDTO };
