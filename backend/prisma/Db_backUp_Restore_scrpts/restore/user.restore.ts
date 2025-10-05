import { oldPrisma, newPrisma } from "../db/index";

export async function restoreUser(chunkSize = 100) {
  const total = await oldPrisma.user.count();
  const totalPrime = await oldPrisma.prime.count();
  console.log(`Migrating ${total} users`);

  for (let skip = 0; skip < total; skip += chunkSize) {
    const batch = await oldPrisma.user.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

      for (const data of batch) {
                console.log("inserting user data", data.id);

        await newPrisma.user.upsert({
          where: { id: data.id },
          update: {},
          create: {
            ...data,
          },
        });
      }

    //   await newPrisma.user.create({
    //     data: {
    //       ...item
    //     },
    //   })

    //       item {
    //   id: 'cmbqs5w2v001pnz01xx3end2l',
    //   name: 'Jayanta Mahato',
    //   email: 'mahatojayanta69@gmail.com',
    //   contactno: '0000000000',
    //   password: '$2b$10$5aEs5R9.MJBZMU4YG1gyYul67igG0O5lfSZh7WGyAMmyUVq6Cvp6G',
    //   telegramid: 'cmbqs5w2v001rnz01kdqd6d1t',
    //   verificationid: 'cmbqs5w2v001tnz015g38qdl0',
    //   progressid: null,
    //   role: 'User',
    //   join_at: 2025-06-10T17:14:00.487Z,
    //   forgotpasswordToken: '96bf5fb7d463588e7be184ada766c77968365261fd6adbec47508b692dda920c',
    //   resetTokenExpires: 2025-06-10T17:24:05.502Z,
    //   accesstoken: []
    // }

    console.log(`✅ Migrated User ${skip + 1} to ${skip + batch.length}`);
  }

  console.log("🎉 All User migrated");
}
