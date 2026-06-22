"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const bcrypt = __importStar(require("bcrypt"));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}
const adapter = new adapter_mariadb_1.PrismaMariaDb(databaseUrl);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Starting database seeding...');
    const permissions = [
        { name: 'CREATE_USER', description: 'Create user account' },
        { name: 'VIEW_USER', description: 'View user accounts' },
        { name: 'UPDATE_USER', description: 'Update user accounts' },
        { name: 'DELETE_USER', description: 'Delete user account (soft delete)' },
        { name: 'MANAGE_SEMESTER', description: 'Create/Update/Delete semesters' },
        { name: 'MANAGE_COMPETITION', description: 'Create/Update/Delete competitions' },
        { name: 'VIEW_ACHIEVEMENT', description: 'View student achievements' },
        { name: 'MANAGE_ACHIEVEMENT', description: 'Input and edit student achievements' },
        { name: 'VIEW_BONUS', description: 'View bonus points and extended scores' },
        { name: 'MANAGE_BONUS', description: 'Calculate bonus points and import scores' },
        { name: 'VIEW_SCHOLARSHIP', description: 'View scholarship candidacy lists' },
        { name: 'MANAGE_SCHOLARSHIP', description: 'Evaluate and approve scholarships' },
        { name: 'VIEW_DASHBOARD', description: 'View statistics dashboard' }
    ];
    console.log('Seeding permissions...');
    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p
        });
    }
    const roles = [
        { name: 'ADMIN', description: 'System Administrator' },
        { name: 'STAFF', description: 'Academic Staff / Department Staff' },
        { name: 'STUDENT', description: 'Student' }
    ];
    console.log('Seeding roles...');
    for (const r of roles) {
        await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: r
        });
    }
    const dbRoles = await prisma.role.findMany();
    const dbPermissions = await prisma.permission.findMany();
    const roleMap = new Map(dbRoles.map(r => [r.name, r.id]));
    const permissionMap = new Map(dbPermissions.map(p => [p.name, p.id]));
    const adminRole = roleMap.get('ADMIN');
    const staffRole = roleMap.get('STAFF');
    const studentRole = roleMap.get('STUDENT');
    console.log('Mapping permissions to roles...');
    const adminPermissions = [
        'CREATE_USER', 'VIEW_USER', 'UPDATE_USER', 'DELETE_USER',
        'MANAGE_SEMESTER', 'MANAGE_COMPETITION',
        'VIEW_ACHIEVEMENT', 'VIEW_BONUS', 'VIEW_SCHOLARSHIP', 'VIEW_DASHBOARD'
    ];
    const staffPermissions = [
        'VIEW_ACHIEVEMENT', 'MANAGE_ACHIEVEMENT',
        'VIEW_BONUS', 'MANAGE_BONUS',
        'VIEW_SCHOLARSHIP', 'MANAGE_SCHOLARSHIP', 'VIEW_DASHBOARD'
    ];
    if (adminRole) {
        for (const pName of adminPermissions) {
            const pId = permissionMap.get(pName);
            if (pId) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: adminRole, permissionId: pId } },
                    update: {},
                    create: { roleId: adminRole, permissionId: pId }
                });
            }
        }
    }
    if (staffRole) {
        for (const pName of staffPermissions) {
            const pId = permissionMap.get(pName);
            if (pId) {
                await prisma.rolePermission.upsert({
                    where: { roleId_permissionId: { roleId: staffRole, permissionId: pId } },
                    update: {},
                    create: { roleId: staffRole, permissionId: pId }
                });
            }
        }
    }
    console.log('Seeding default accounts (password: password123)...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { studentCode: 'ADMIN001' },
        update: {},
        create: {
            studentCode: 'ADMIN001',
            fullName: 'System Administrator',
            email: 'admin@starpoint.dev',
            phone: '0123456789',
            password: passwordHash
        }
    });
    if (adminRole) {
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: adminUser.id, roleId: adminRole } },
            update: {},
            create: { userId: adminUser.id, roleId: adminRole }
        });
    }
    const staffUser = await prisma.user.upsert({
        where: { studentCode: 'STAFF001' },
        update: {},
        create: {
            studentCode: 'STAFF001',
            fullName: 'Academic Giáo Vụ',
            email: 'staff@starpoint.dev',
            phone: '0987654321',
            password: passwordHash
        }
    });
    if (staffRole) {
        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: staffUser.id, roleId: staffRole } },
            update: {},
            create: { userId: staffUser.id, roleId: staffRole }
        });
    }
    const students = [
        { studentCode: 'SV001', fullName: 'Nguyễn Văn Nam', email: 'sv001@starpoint.dev' },
        { studentCode: 'SV002', fullName: 'Trần Thị Thuỷ', email: 'sv002@starpoint.dev' },
        { studentCode: 'SV003', fullName: 'Lê Hoàng Anh', email: 'sv003@starpoint.dev' },
        { studentCode: 'SV004', fullName: 'Phạm Minh Đức', email: 'sv004@starpoint.dev' },
        { studentCode: 'SV005', fullName: 'Ngô Thị Mai', email: 'sv005@starpoint.dev' }
    ];
    for (const s of students) {
        const studentUser = await prisma.user.upsert({
            where: { studentCode: s.studentCode },
            update: {},
            create: {
                studentCode: s.studentCode,
                fullName: s.fullName,
                email: s.email,
                password: passwordHash
            }
        });
        if (studentRole) {
            await prisma.userRole.upsert({
                where: { userId_roleId: { userId: studentUser.id, roleId: studentRole } },
                update: {},
                create: { userId: studentUser.id, roleId: studentRole }
            });
        }
    }
    console.log('Seeding semesters...');
    const semesters = [
        {
            name: 'Học kỳ 1 - Năm học 2025-2026',
            year: 2025,
            term: 1,
            startDate: new Date('2025-09-05T00:00:00.000Z'),
            endDate: new Date('2026-01-15T23:59:59.000Z')
        },
        {
            name: 'Học kỳ 2 - Năm học 2025-2026',
            year: 2025,
            term: 2,
            startDate: new Date('2026-02-10T00:00:00.000Z'),
            endDate: new Date('2026-06-25T23:59:59.000Z')
        }
    ];
    for (const sem of semesters) {
        const existing = await prisma.semester.findFirst({
            where: { year: sem.year, term: sem.term }
        });
        if (!existing) {
            await prisma.semester.create({ data: sem });
        }
    }
    console.log('🎉 Database seeding completed successfully.');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map