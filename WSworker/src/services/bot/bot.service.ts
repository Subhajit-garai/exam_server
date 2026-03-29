
import { BotUserService } from "./bot.user.service.js";

export class BotService {
    public user: BotUserService;

    constructor() {
        this.user = new BotUserService();
    }
}
