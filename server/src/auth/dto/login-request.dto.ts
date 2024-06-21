import { z } from 'zod';

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export type { LoginRequestDto };
export default LoginRequestSchema;