import { prisma } from './prisma';
import { Session } from 'next-auth';

/**
 * Ensures user exists in database, syncing with session data
 * This handles cases where the database was reset but sessions still exist
 */
export async function ensureUserExists(session: Session) {
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error('Invalid session data');
  }

  const user = await prisma.user.upsert({
    where: { id: session.user.id },
    create: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || null,
      image: session.user.image || null,
      emailVerified: null, // Will be set by NextAuth
    },
    update: {
      name: session.user.name || null,
      image: session.user.image || null,
      // Don't update email as it might cause conflicts
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return user;
}