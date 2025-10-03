import { z } from 'zod'
import { randomUUID } from 'crypto';
import { generateToken, hashPassword } from '~~/server/utils/auth';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long")
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const register = registerSchema.safeParse(body)

  if (!register.success) {
    return {
      result: "error",
      message: register.error.errors[0]?.message || "Invalid body"
    }
  }

  const data = register.data
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  })

  if (existingUser) return {
    result: "error",
    message: "Email already registered"
  }
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: data.email,
      username: data.username ?? null,
      password: await hashPassword(data.password)
    }
  })

  const { accessToken, refreshToken } = await generateToken(user.id);

  setCookie(event, 'access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60,
    path: '/'
  });

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  return {
    result: "ok",
    message: "User registered successfully"
  }
})