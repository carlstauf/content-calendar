import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100)
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>