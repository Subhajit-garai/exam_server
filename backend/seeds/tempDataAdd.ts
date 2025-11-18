import prisma from "@repo/db/index";


const main = async () => {



  
 



  console.log("data added successfully");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
