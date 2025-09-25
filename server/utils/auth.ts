import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { H3Event } from 'h3';
import { prisma } from './prisma';

export async function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, useRuntimeConfig().jwtSecret) as { userId: string };
    return prisma.users.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(event: H3Event) {
  const token = getCookie(event, 'access_token');
  if (!token) return null;
  return getUserFromToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ userId }, useRuntimeConfig().jwtSecret, {
    expiresIn: '1h'
  });
}