"use strict";
// import { Prisma } from '../../../dist/packages/prisma'
// import { PrismaClient as NewClient } from '../../../dist/packages/prisma'
// // import { PrismaClient as OldClient } from  '../../old/generated/old'
// export { Prisma }
// const prismaNEWClientSingleton = () => {
//   return new NewClient()
// }
// const prismaOLDClientSingleton = () => {
//   return new OldClient()
// }
// declare global {
//   var oldPrisma: undefined | ReturnType<typeof prismaOLDClientSingleton>
//   var newPrisma: undefined | ReturnType<typeof prismaNEWClientSingleton>
// }
// const oldPrisma = globalThis.oldPrisma ?? prismaOLDClientSingleton()
// const newPrisma = globalThis.newPrisma ?? prismaNEWClientSingleton()
// if (process.env.NODE_ENV !== 'production') {
//   globalThis.oldPrisma = oldPrisma
//   globalThis.newPrisma = newPrisma
//   // globalThis.tsprisma = tsprisma
// }
// export { oldPrisma ,newPrisma}
