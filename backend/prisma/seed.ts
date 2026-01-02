// @ts-ignore: PrismaClient is generated at runtime
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@engilife.ai' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'demo@engilife.ai',
      passwordHash,
      emailVerified: true,
      branch: 'Computer Science',
      semester: 3,
      joinedDate: new Date().toLocaleDateString(),
      security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() },
      achievements: [
        { id: '1', title: 'Early Adopter', description: 'Joined the platform early', icon: 'Award', unlocked: true, dateUnlocked: new Date().toISOString() }
      ],
      subjects: {
        create: [
            { name: 'Data Structures', attended: 24, total: 28, minPercent: 75, progress: 60, color: 'bg-primary-500' },
            { name: 'Algorithms', attended: 18, total: 20, minPercent: 75, progress: 40, color: 'bg-emerald-500' }
        ]
      },
      tasks: {
        create: [
            { title: 'Finish Lab Report', priority: 'High', deadline: 'Tomorrow', completed: false, category: 'Academic' }
        ]
      }
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    (process as any).exit(1);
  });