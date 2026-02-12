
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Gym
  const gym = await prisma.gym.upsert({
    where: { name: 'Main Street Gym' },
    update: {},
    create: {
      id: 'default-gym',
      name: 'Main Street Gym',
      capacity: 100,
      address: { street: '123 Main St', city: 'Cityville', country: 'Countryland' },
    },
  });

  // Trainer
  await prisma.trainer.upsert({
    where: { id: 'default-trainer' }, // id is not unique in schema? It is @id.
    update: {},
    create: {
      id: 'default-trainer',
      name: 'John Doe',
      certification: 'NSCA-CPT',
      certificationExpiry: new Date('2030-01-01'),
    },
  });

  // Member
  const member = await prisma.member.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      id: 'default-member',
      name: 'Jane Doe',
      email: 'jane@example.com',
      gymId: gym.id,
      membershipTier: 'Silver',
    },
  });

  // Session
  await prisma.session.create({
    data: {
      id: 'default-session',
      memberId: member.id,
      date: new Date(),
    }
  }).catch(() => console.log('Session already exists (or ignoring duplication for seed)'));

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
