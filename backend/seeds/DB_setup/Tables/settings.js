"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const index_1 = __importDefault(require("@repo/db/index"));
const settings = async () => {
    const bot_access = await index_1.default.appConfig.create({
        data: {
            feature: "bot-access",
            settings: { status: "open" },
        },
    });
    const raser_pay_access_setting = await index_1.default.appConfig.create({
        data: {
            feature: "razerpay-testaccess",
            settings: { status: "close" },
        },
    });
    const payment_access = await index_1.default.appConfig.create({
        data: {
            feature: "token-purchases",
            settings: { status: "close" },
        },
    });
    const user_login_access = await index_1.default.appConfig.create({
        data: {
            feature: "user-login",
            settings: { status: "open" },
        },
    });
    const user_signup_access = await index_1.default.appConfig.create({
        data: {
            feature: "user-signup",
            settings: { status: "close" },
        },
    });
};
exports.settings = settings;
(0, exports.settings)();
