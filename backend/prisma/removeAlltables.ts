import { remove_all_tables } from "@repo/packages/prisma/sql";
import prisma from "@repo/db/index"



const main  = async() =>{


   try {
    let res = await prisma.$queryRawTyped(remove_all_tables())
    console.log("responce fro removing all tables " , res);
   } catch (error) {
    console.log("error in removing all tables " , error);
    
   }
    

}
const oneTableData  = async() =>{


   try {
   //  let res = await prisma.questions.deleteMany({
   //    where:{
   //       topic:"NETWORK"
   //    }
   //  })

   //  console.log("responce fro removing  tables  data" , res);

   // remove all from mcok_question_map
   // await prisma.mock_question_map.deleteMany({})
   } catch (error) {
    console.log("error in removing all tables " , error);
    
   }
    

}

// oneTableData()

main()



