import { z } from "zod";

const UpdateProfileSchema = z
  .object({
    oldPassword: z
      .string()
      .regex(
        new RegExp(
          "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$",
        ),
      )
      .optional(),
    newPassword: z
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
  })
  .refine((schema) => {
    return !(
      (!schema.oldPassword && schema.newPassword) ||
      (!schema.newPassword && schema.oldPassword)
    );
  });

type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

export type { UpdateProfileDTO };
export default UpdateProfileSchema;
