import { StatusEnum } from "../../entities/status.entity";
import { z } from "zod";

const UpdateApplicationStatusSchema = z.object({
  status: z.enum([StatusEnum.ACCEPTED, StatusEnum.REJECTED]),
});

type UpdateApplicationStatusDTO = z.input<typeof UpdateApplicationStatusSchema>;

export default UpdateApplicationStatusSchema;
export { UpdateApplicationStatusDTO };
