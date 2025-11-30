import { PrismaClient, Prisma } from "@repo/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
};
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// const prismaTSClientSingleton = () => {
//   return new TsClient()
// }

// declare global {
//   var tsprisma: undefined | ReturnType<typeof prismaTSClientSingleton>
// }

// export const tsprisma = globalThis.tsprisma ?? prismaTSClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
  // globalThis.tsprisma = tsprisma
}

export { Prisma };
export default prisma;
