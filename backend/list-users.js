const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const databaseUrl = process.env.DATABASE_URL || "mysql://starpoint_user:161005@localhost:3307/starpoint_db";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      studentCode: true,
      fullName: true,
      email: true,
      deletedAt: true,
    }
  });
  console.log('--- List of all users in DB ---');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
