import { z } from 'zod';

const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(
    new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$')
  ),
  username: z.string().refine(username => {
    return username.trim().length >= 2;
  })
});

type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export type { RegisterRequestDto };
export default RegisterRequestSchema;