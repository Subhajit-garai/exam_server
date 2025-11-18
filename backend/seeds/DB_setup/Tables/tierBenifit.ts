import { createOrUpdateTier } from "../../../src/controllers/tier.controller";
import prisma from "@/db";


export const tierBenifit = async() =>{



  let None =  await prisma.tier.create({
    data:{
      name:"None"
    }
  })
  let Bronze =  await prisma.tier.create({
    data:{
      name:"Bronze"
    }
  })
  let Silver =  await prisma.tier.create({
    data:{
      name:"Silver"
    }
  })
  let GOLD =  await prisma.tier.create({
    data:{
      name:"Gold"
    }
  })

    await createOrUpdateTier("None", [
    { feature: "Quiz", access: false, limit: null },
    { feature: "Test", access: false, limit: null },
    { feature: "Dpp", access: false, limit: 10 },
    { feature: "PYQ", access: false, limit: 10 },
    { feature: "Mock", access: false, limit: 5 },
  ]);
  await createOrUpdateTier("Bronze", [
    { feature: "Quiz", access: true, limit: null },
    { feature: "Test", access: false, limit: null },
    { feature: "Dpp", access: false, limit: 10 },
    { feature: "PYQ", access: false, limit: 10 },
    { feature: "Mock", access: false, limit: 5 },
  ]);
  await createOrUpdateTier("Silver", [
    { feature: "Quiz", access: true, limit: null },
    { feature: "Test", access: true, limit: null },
    { feature: "Dpp", access: true, limit: 10 },
    { feature: "PYQ", access: false, limit: 10 },
    { feature: "Mock", access: false, limit: 5 },
  ]);
  await createOrUpdateTier("Gold", [
    { feature: "Quiz", access: true, limit: null },
    { feature: "Test", access: true, limit: null },
    { feature: "Dpp", access: true, limit: 10 },
    { feature: "PYQ", access: true, limit: 10 },
    { feature: "Mock", access: true, limit: 5 },
  ]);

}