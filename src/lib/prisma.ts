import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Multi-tenant query helper — scopes all queries by tenantId
export function tenantDb(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: any) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }: any) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }: any) {
          (args as any).data = { ...(args as any).data, tenantId };
          return query(args);
        },
      },
    },
  });
}
