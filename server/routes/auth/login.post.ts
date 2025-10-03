import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const login = loginSchema.safeParse(body);

  if (!login.success) {
    return {
      result: "error",
      message: login.error.errors[0]?.message || "Invalid body"
    }
  }
  const data = login.data;
  const user = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  });

  if (!user) {
    return {
      result: "error",
      message: 'Email or password is incorrect'
    }
  }

  if (!await comparePasswords(data.password, user.password)) {
    return {
      result: "error",
      message: 'Email or password is incorrect'
    }
  }

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
    message: 'User logged in successfully'
  }
});