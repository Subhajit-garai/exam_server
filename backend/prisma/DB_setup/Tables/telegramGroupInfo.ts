import prisma from "../../../db/index";

export const telegramGroupInfo = async () => {
  let groupInfo = await prisma.telegramGroupInfo.create({
    data: {
      groupid: "-1002506753144",
      groupname: "Jeca premium group",
      grouplink: "test",
      isTopic: true,
      isPremium: true,
      adminIds: ["7057093987"],
      isBanned: false,
      groupType: "supergroup",
      timezone: "Asia/Kolkata",
      features: { quiz: true, dailyTips: false },
    },
  });

  let groupInfo2 = await prisma.telegramGroupInfo.create({
    data: {
      groupid: "-1002365541288",
      groupname: "WB JECA 2025",
      grouplink: "test",
      isTopic: false,
      isPremium: false,
      adminIds: ["7057093987"],
      isBanned: false,
      groupType: "group",
      timezone: "Asia/Kolkata",
      features: { quiz: true, dailyTips: false },
    },
  });

  let topicInfo = await prisma.telegramGroupTopic.create({
    data: {
      groupId: groupInfo.id,
      name: "quiz",
      topicId: 3,
    },
  });

  await prisma.botQuizConfig.create({
    data: {
      chatId: groupInfo.id,
      exam: "JECA",
      quiztopic: ["UNIX"],
      question_count: "25",
      rapidtopic: [
        "OS",
        "C",
        "DBMS",
        "NETWORK",
        "UNIX",
        "COMPUTER",
        "DSA",
        "SE",
        "CPP",
        "ML",
      ],
    },
  });

  await prisma.botQuizConfig.create({
    data: {
      chatId: groupInfo2.id,
      exam: "JECA",
      quiztopic: ["UNIX"],
      question_count: "25",
      rapidtopic: [
        "OS",
        "C",
        "DBMS",
        "NETWORK",
        "UNIX",
        "COMPUTER",
        "DSA",
        "SE",
        "CPP",
        "ML",
      ],
    },
  });
};
