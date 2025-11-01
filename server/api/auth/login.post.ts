import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, "Please provide your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse);

  const { identifier, password } = body

  let user = null;
  if (identifier.includes('@')) {
    user = await prisma.user.findUnique({ where: { email: identifier } });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });
  }

  if (!user) {
    return {
      result: "error",
      message: 'Email/username or password is incorrect'
    }
  }

  if (!await comparePasswords(password, user.password)) {
    return {
      result: "error",
      message: 'Email/username or password is incorrect'
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