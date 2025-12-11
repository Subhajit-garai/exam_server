import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotQuizConfigService } from "../../services/bot/botQuizConfig.service.js";
import { createBotQuizConfigSchema, updateBotQuizConfigSchema } from "@/zod/bot.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

const botQuizConfigService = new BotQuizConfigService();



export const getUserBotQuizConfig = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const config = await botQuizConfigService.getConfigById(id);
        if (!config) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        // Users might only be allowed to see certain configs?
        // For now assuming read access if they have the ID, or we could filter by creator if needed.
        // If requirement is 'for admin and user', user usually sees what they created or public ones.
        // Given the schema has `created_by`, we *could* enforce ownership here.
        // But for now, simple read by ID.
        res.json({ success: true, data: config });
    } catch (error) {
        console.error("Error fetching bot quiz config for user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllUserBotQuizConfigs = async (req: any, res: any) => {
    try {
        // Users normally see their own configs
        const query = {
            ...req.query,
            created_by: req.user?.id // Assuming user ID is attached to req.user
        };

        // If request comes from bot authentication, req.user might be diff or we use a different param.
        // The previous analysis showed `req.bot_user` in some bot controllers, but `req.user` in others (standard auth).
        // Let's assume standard 'user' (web dashboard) for now since it's a "user controller".

        const result = await botQuizConfigService.getAllConfigs(query);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching bot quiz configs for user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const createBotQuizConfig = asyncHandler(async (req: any, res: any) => {

    const validation = createBotQuizConfigSchema.safeParse(req.body);
    if (!validation.success) {
        throw ZodDataSafeParse(validation)
    }
    const config = await botQuizConfigService.createConfig(validation.data, req.user);
    res.json({ success: true, message: "Configuration created successfully", data: config });
})

export const updateBotQuizConfig = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const validation = updateBotQuizConfigSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Invalid input", errors: validation.error.errors });
        }
        const config = await botQuizConfigService.updateConfig(id, validation.data);
        res.json({ success: true, message: "Configuration updated successfully", data: config });
    } catch (error) {
        console.error("Error updating bot quiz config:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteBotQuizConfig = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await botQuizConfigService.deleteConfig(id);
        res.json({ success: true, message: "Configuration deleted successfully" });
    } catch (error) {
        console.error("Error deleting bot quiz config:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getBotQuizConfig = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const config = await botQuizConfigService.getConfigById(id);
        if (!config) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        console.error("Error fetching bot quiz config:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllBotQuizConfigs = async (req: any, res: any) => {
    try {
        const result = await botQuizConfigService.getAllConfigs(req.query);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching bot quiz configs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
