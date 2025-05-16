import { remove_all_tables } from "@prisma/client/sql"
import prisma from "../db"



const main  = async() =>{


   try {
    let res = await prisma.$queryRawTyped(remove_all_tables())
    console.log("responce fro removing all tables " , res);
   } catch (error) {
    console.log("error in removing all tables " , error);
    
   }
    

}

main()

