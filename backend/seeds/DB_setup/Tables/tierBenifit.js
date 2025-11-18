"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tierBenifit = void 0;
const tier_controller_1 = require("../../../src/controllers/tier.controller");
const db_1 = __importDefault(require("@/db"));
const tierBenifit = async () => {
    let None = await db_1.default.tier.create({
        data: {
            name: "None"
        }
    });
    let Bronze = await db_1.default.tier.create({
        data: {
            name: "Bronze"
        }
    });
    let Silver = await db_1.default.tier.create({
        data: {
            name: "Silver"
        }
    });
    let GOLD = await db_1.default.tier.create({
        data: {
            name: "Gold"
        }
    });
    await (0, tier_controller_1.createOrUpdateTier)("None", [
        { feature: "Quiz", access: false, limit: null },
        { feature: "Test", access: false, limit: null },
        { feature: "Dpp", access: false, limit: 10 },
        { feature: "PYQ", access: false, limit: 10 },
        { feature: "Mock", access: false, limit: 5 },
    ]);
    await (0, tier_controller_1.createOrUpdateTier)("Bronze", [
        { feature: "Quiz", access: true, limit: null },
        { feature: "Test", access: false, limit: null },
        { feature: "Dpp", access: false, limit: 10 },
        { feature: "PYQ", access: false, limit: 10 },
        { feature: "Mock", access: false, limit: 5 },
    ]);
    await (0, tier_controller_1.createOrUpdateTier)("Silver", [
        { feature: "Quiz", access: true, limit: null },
        { feature: "Test", access: true, limit: null },
        { feature: "Dpp", access: true, limit: 10 },
        { feature: "PYQ", access: false, limit: 10 },
        { feature: "Mock", access: false, limit: 5 },
    ]);
    await (0, tier_controller_1.createOrUpdateTier)("Gold", [
        { feature: "Quiz", access: true, limit: null },
        { feature: "Test", access: true, limit: null },
        { feature: "Dpp", access: true, limit: 10 },
        { feature: "PYQ", access: true, limit: 10 },
        { feature: "Mock", access: true, limit: 5 },
    ]);
};
exports.tierBenifit = tierBenifit;
