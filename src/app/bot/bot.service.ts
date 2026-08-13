
import { BotExamService } from "./bot.exam.service.js";
import { BotScoreService } from "./bot.score.service.js";
import { BotTelegramService } from "./bot.telegram.service.js";
import { BotQuizConfigService } from "./botQuizConfig.service.js";

export class BotService {

    public exam: BotExamService;
    public score: BotScoreService;
    public telegram: BotTelegramService;
    public quiz: BotQuizConfigService;

    constructor() {
        this.quiz = new BotQuizConfigService();
        this.exam = new BotExamService();
        this.score = new BotScoreService();
        this.telegram = new BotTelegramService();
    }
}
