"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:161005@localhost:3306/starpointdb';
const adapter = new adapter_mariadb_1.PrismaMariaDb(databaseUrl);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Fetching user ADMIN001...');
    const user = await prisma.user.findUnique({
        where: { studentCode: 'ADMIN001' },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!user) {
        console.log('User ADMIN001 not found.');
        return;
    }
    console.log('User roles:');
    for (const ur of user.userRoles) {
        console.log(`- Role: ${ur.role.name}`);
        console.log('  Permissions:');
        for (const rp of ur.role.rolePermissions) {
            console.log(`    * ${rp.permission.name}`);
        }
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-permissions.js.map