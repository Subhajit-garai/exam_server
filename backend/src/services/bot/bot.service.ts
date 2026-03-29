import { BotAdminService } from "./bot.admin.service.js";
import { BotExamService } from "./bot.exam.service.js";
import { BotScoreService } from "./bot.score.service.js";
import { BotTelegramService } from "./bot.telegram.service.js";

export class BotService {
    public admin: BotAdminService;
    public exam: BotExamService;
    public score: BotScoreService;
    public telegram: BotTelegramService;

    constructor() {
        this.admin = new BotAdminService();
        this.exam = new BotExamService();
        this.score = new BotScoreService();
        this.telegram = new BotTelegramService();
    }
}
