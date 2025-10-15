import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token');
  if (!refreshToken) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' });
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' });
  }

  const newAccessToken = jwt.sign(
    { userId: tokenRecord.userId },
    useRuntimeConfig().jwtSecret,
    { expiresIn: '1h' }
  );

  setCookie(event, 'access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60,
    path: '/',
  });

  return { result: "ok" };
});
