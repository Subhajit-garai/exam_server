// src/utils/logger.ts

export const logger = {
  info: (...msg: any[]) => { process.env.IS_LOGGER === "true" && console.log("ℹ️ ", ...msg) },
  success: (...msg: any[]) => { process.env.IS_LOGGER === "true" && console.log("✅ ", ...msg) },
  error: (...msg: any[]) => { process.env.IS_LOGGER === "true" && console.error("❌ ", ...msg) },
};
