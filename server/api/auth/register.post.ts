import { z } from 'zod'
import { randomUUID } from 'crypto';
import { generateToken, hashPassword } from '~~/server/utils/auth';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username must be at least 1 character long")
    .max(60, "Username must be at most 60 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long")
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  const existingUser = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })

  if (existingUser) return {
    result: "error",
    message: "Email already registered"
  }

  const existingUsername = await prisma.user.findUnique({
    where: {
      username: body.username
    }
  })

  if (existingUsername) return {
    result: "error",
    message: "Username already taken"
  }

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: body.email,
      username: body.username,
      password: await hashPassword(body.password)
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