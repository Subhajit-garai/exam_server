// import { prisma } from "../db";
export class telegramManager {
  private static instance: telegramManager;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new telegramManager();
    }
    return this.instance;
  }

  private constructor() {
    this.init();
  }

  private async init() {
    // let telegram_groupdata = await prisma.telegramGroupInfo.findMany({});

    // if (!telegram_groupdata) {
    //   console.log("No telegram group data found");
    //   return;
    // }

  }

  isAdmin() {}
}
