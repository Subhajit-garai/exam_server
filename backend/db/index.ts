import { PrismaClient as PgClient } from "@prisma/client";
// import { PrismaClient as TsClient } from "@prisma/timescale-client";


const prismaClientSingleton = () => {
  return new PgClient()
}
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

// const prismaTSClientSingleton = () => {
//   return new TsClient()
// }

// declare global {
//   var tsprisma: undefined | ReturnType<typeof prismaTSClientSingleton>
// }

// export const tsprisma = globalThis.tsprisma ?? prismaTSClientSingleton()


if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
  // globalThis.tsprisma = tsprisma
}


export default prisma
