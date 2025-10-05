import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreIssue(chunkSize = 100) {
  const alldata = await oldPrisma.issue.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.issue.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.issue data", data.id);

      await newPrisma.issue.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
                    IssueDetails: data.IssueDetails ? data.IssueDetails : Prisma.JsonNull, // Handle potential null values
          
        },
      });
    }
  }
}
