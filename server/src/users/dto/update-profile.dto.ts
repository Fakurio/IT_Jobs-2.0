import { z } from "zod";

const UpdateProfileSchema = z.object({
  password: z
    .string()
    .regex(
      new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$",
      ),
    )
    .optional(),
  username: z
    .string()
    .refine((username) => {
      if (username) {
        return username.trim().length >= 2;
      }
      return false;
    })
    .optional(),
});

type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

export type { UpdateProfileDTO };
export default UpdateProfileSchema;
